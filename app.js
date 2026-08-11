const menus = [
  { id: 'kimchi-jjigae', name: '돼지고기 김치찌개', category: '한식', mood: ['warm','spicy','hearty'], price: 9000, time: 25, emoji: '🍲', desc: '칼칼한 국물에 푹 익은 김치, 실패 없는 든든한 한 끼예요.' },
  { id: 'donkatsu', name: '바삭한 돈카츠', category: '일식', mood: ['hearty'], price: 12000, time: 35, emoji: '🍛', desc: '겉은 바삭하고 속은 촉촉한, 기분 좋은 식감의 정석이에요.' },
  { id: 'jeyuk-bokkeum', name: '직화 제육볶음', category: '한식', mood: ['spicy','hearty'], price: 10000, time: 30, emoji: '🍖', desc: '불향 가득한 매콤달콤 제육으로 오후 에너지를 충전해요.' },
  { id: 'beef-pho', name: '소고기 쌀국수', category: '아시안', mood: ['warm','fresh'], price: 11000, time: 25, emoji: '🍜', desc: '맑고 향긋한 국물과 부드러운 소고기가 편안하게 어울려요.' },
  { id: 'salmon-poke', name: '연어 포케', category: '샐러드', mood: ['fresh'], price: 13000, time: 20, emoji: '🥗', desc: '신선한 연어와 채소, 톡톡 씹히는 곡물로 산뜻하고 든든해요.' },
  { id: 'malatang', name: '마라탕', category: '중식', mood: ['spicy','warm'], price: 14000, time: 35, emoji: '🥘', desc: '얼얼하고 화끈한 국물 한 입이면 쌓인 스트레스가 사르르.' },
  { id: 'perilla-soba', name: '들기름 메밀국수', category: '한식', mood: ['fresh'], price: 10000, time: 20, emoji: '🍝', desc: '고소한 들기름 향과 탱글한 메밀면이 깔끔하게 입맛을 살려줘요.' },
  { id: 'cheeseburger', name: '수제 치즈버거', category: '양식', mood: ['hearty'], price: 15000, time: 30, emoji: '🍔', desc: '육즙 가득 패티와 녹진한 치즈로 오늘만큼은 제대로 즐겨요.' },
  { id: 'sundubu-jjigae', name: '순두부찌개', category: '한식', mood: ['warm','spicy'], price: 8500, time: 25, emoji: '🍲', desc: '몽글몽글 순두부와 얼큰한 국물이 속을 따뜻하게 채워줘요.' },
  { id: 'shrimp-cream-pasta', name: '새우 크림 파스타', category: '양식', mood: ['hearty'], price: 16000, time: 45, emoji: '🍝', desc: '탱글한 새우와 부드러운 크림소스로 여유로운 점심을 즐겨요.' },
  { id: 'assorted-sushi', name: '초밥 모둠', category: '일식', mood: ['fresh'], price: 19000, time: 45, emoji: '🍣', desc: '한 점씩 골라 먹는 재미와 신선함이 있는 기분 좋은 한 끼예요.' },
  { id: 'dakgalbi-bowl', name: '닭갈비 덮밥', category: '한식', mood: ['spicy','hearty'], price: 11000, time: 30, emoji: '🍱', desc: '매콤한 닭갈비와 따끈한 밥을 한 그릇에 든든하게 담았어요.' }
];

const LIKED_STORAGE_KEY = 'lunch-pick-liked-menus';

let selectedMood = 'all';
let recommendationMode = 'random';
let popularCursor = 0;
let currentMenu = menus[0];
let lastIndex = -1;
let toastTimer;
let likedMenuIds = loadLikedMenuIds();
const likeCounts = new Map(menus.map(menu => [menu.id, 0]));

const $ = (selector) => document.querySelector(selector);
const card = $('#menuCard');
const pickButton = $('#pickButton');
const supabaseConfig = window.LUNCH_PICK_SUPABASE || {};
const isSupabaseConfigured = Boolean(
  window.supabase &&
  /^https:\/\/.+\.supabase\.co$/.test(supabaseConfig.url || '') &&
  supabaseConfig.anonKey
);
const supabaseClient = isSupabaseConfigured
  ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey)
  : null;

const formatPrice = (price) => `${price.toLocaleString('ko-KR')}원`;
const formatLikeCount = (count) => Number(count || 0).toLocaleString('ko-KR');

function loadLikedMenuIds() {
  try {
    const stored = JSON.parse(localStorage.getItem(LIKED_STORAGE_KEY) || '[]');
    return new Set(Array.isArray(stored) ? stored : []);
  } catch {
    return new Set();
  }
}

function saveLikedMenuIds() {
  localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify([...likedMenuIds]));
}

function setToday() {
  const parts = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).formatToParts(new Date());
  const value = parts.map(part => part.value).join('').replace(/\s/g, ' ');
  $('#todayLabel').textContent = value;
}

function getCandidates() {
  const budget = $('#budgetSelect').value;
  const timing = $('#timeSelect').value;
  return menus.filter(menu => {
    const moodOk = selectedMood === 'all' || menu.mood.includes(selectedMood);
    const budgetOk = budget === 'all' || menu.price <= Number(budget);
    const timeOk = timing === 'all' || (timing === 'quick' ? menu.time <= 30 : menu.time <= 60);
    return moodOk && budgetOk && timeOk;
  });
}

function getMenusByPopularity(sourceMenus = menus) {
  return [...sourceMenus].sort((a, b) => {
    const countDifference = (likeCounts.get(b.id) || 0) - (likeCounts.get(a.id) || 0);
    return countDifference || menus.indexOf(a) - menus.indexOf(b);
  });
}

function syncMainHeart() {
  const button = $('#heartButton');
  const liked = likedMenuIds.has(currentMenu.id);
  button.classList.toggle('liked', liked);
  button.setAttribute('aria-pressed', String(liked));
  button.setAttribute('aria-label', `${currentMenu.name} ${liked ? '저장 취소' : '저장하기'}`);
  $('#heartCount').textContent = formatLikeCount(likeCounts.get(currentMenu.id));
}

function syncQuickHeart(menuId) {
  const button = document.querySelector(`.quick-like[data-like-menu="${menuId}"]`);
  if (!button) return;
  const menu = menus.find(item => item.id === menuId);
  const liked = likedMenuIds.has(menuId);
  button.classList.toggle('liked', liked);
  button.setAttribute('aria-pressed', String(liked));
  button.setAttribute('aria-label', `${menu.name} ${liked ? '저장 취소' : '저장하기'}`);
  button.querySelector('[data-like-count]').textContent = formatLikeCount(likeCounts.get(menuId));
}

function syncLikeButtons(menuId) {
  syncQuickHeart(menuId);
  if (currentMenu.id === menuId) syncMainHeart();
}

function setLikeButtonsBusy(menuId, busy) {
  if (currentMenu.id === menuId) $('#heartButton').disabled = busy;
  const quickButton = document.querySelector(`.quick-like[data-like-menu="${menuId}"]`);
  if (quickButton) quickButton.disabled = busy;
}

function renderMenu(menu, score = Math.floor(Math.random() * 8) + 92) {
  currentMenu = menu;
  $('#categoryPill').textContent = menu.category;
  $('#menuName').textContent = menu.name;
  $('#menuDescription').textContent = menu.desc;
  $('#menuTime').textContent = `${menu.time}분`;
  $('#menuPrice').textContent = formatPrice(menu.price);
  $('#foodEmoji').textContent = menu.emoji;
  $('#foodVisual').setAttribute('aria-label', `${menu.name} 일러스트`);
  $('#matchScore').textContent = score;
  syncMainHeart();
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function pickMenu() {
  const candidates = getCandidates();
  if (!candidates.length) {
    showToast('조건에 맞는 메뉴가 없어요. 필터를 조금 넓혀주세요!');
    return;
  }
  let selectedMenu;
  if (recommendationMode === 'popular') {
    const rankedMenus = getMenusByPopularity(candidates);
    selectedMenu = rankedMenus[popularCursor % rankedMenus.length];
    popularCursor += 1;
  } else {
    let index = Math.floor(Math.random() * candidates.length);
    if (candidates.length > 1) {
      while (menus.indexOf(candidates[index]) === lastIndex) index = Math.floor(Math.random() * candidates.length);
    }
    selectedMenu = candidates[index];
  }
  lastIndex = menus.indexOf(selectedMenu);
  card.classList.remove('shuffling');
  void card.offsetWidth;
  card.classList.add('shuffling');
  setTimeout(() => renderMenu(selectedMenu), 210);
}

function renderQuickCards() {
  const quickMenus = getMenusByPopularity().slice(0, 4);
  $('#quickGrid').innerHTML = quickMenus.map((menu, index) => {
    const liked = likedMenuIds.has(menu.id);
    return `
      <article class="quick-card" data-menu-id="${menu.id}">
        <span class="quick-rank" aria-label="인기 ${index + 1}위">${index + 1}</span>
        <button class="quick-select" type="button" data-menu="${menu.id}" aria-label="${menu.name} 추천 보기">
          <span class="quick-emoji">${menu.emoji}</span>
          <h3>${menu.name}</h3>
          <p>${menu.category} · ${menu.time}분 · ${formatPrice(menu.price)}</p>
          <span class="arrow">↗</span>
        </button>
        <button class="quick-like${liked ? ' liked' : ''}" type="button" data-like-menu="${menu.id}" aria-label="${menu.name} ${liked ? '저장 취소' : '저장하기'}" aria-pressed="${liked}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z"/></svg>
          <span data-like-count>${formatLikeCount(likeCounts.get(menu.id))}</span>
        </button>
      </article>`;
  }).join('');
}

async function loadLikeCounts() {
  if (!supabaseClient) return;
  const { data, error } = await supabaseClient.rpc('get_menu_like_counts');
  if (error) {
    console.error('Failed to load menu save counts:', error.message);
    showToast('저장 수를 불러오지 못했어요. Supabase 설정을 확인해주세요.');
    return;
  }
  (data || []).forEach(row => likeCounts.set(row.menu_id, Number(row.like_count)));
  renderQuickCards();
  syncMainHeart();
}

async function toggleMenuLike(menu) {
  if (!supabaseClient) {
    showToast('Supabase URL과 Publishable key를 먼저 설정해주세요.');
    return;
  }

  const shouldLike = !likedMenuIds.has(menu.id);
  setLikeButtonsBusy(menu.id, true);

  const { data, error } = await supabaseClient.rpc('change_menu_like', {
    p_menu_id: menu.id,
    p_delta: shouldLike ? 1 : -1
  });

  setLikeButtonsBusy(menu.id, false);
  if (error) {
    console.error('Failed to update menu save count:', error.message);
    showToast('저장하지 못했어요. 잠시 후 다시 시도해주세요.');
    return;
  }

  likeCounts.set(menu.id, Number(data));
  if (shouldLike) likedMenuIds.add(menu.id);
  else likedMenuIds.delete(menu.id);
  saveLikedMenuIds();
  renderQuickCards();
  syncMainHeart();
  showToast(shouldLike ? `${menu.name}, 저장했어요!` : `${menu.name}, 저장을 취소했어요.`);
}

$('#moodChips').addEventListener('click', event => {
  const button = event.target.closest('.chip');
  if (!button) return;
  document.querySelectorAll('.chip').forEach(chip => chip.classList.remove('active'));
  button.classList.add('active');
  selectedMood = button.dataset.value;
  popularCursor = 0;
});

$('.mode-buttons').addEventListener('click', event => {
  const button = event.target.closest('.mode-button');
  if (!button) return;
  document.querySelectorAll('.mode-button').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  recommendationMode = button.dataset.mode;
  popularCursor = 0;
  $('#pickButtonLabel').textContent = recommendationMode === 'popular'
    ? '인기 메뉴 추천받기'
    : '오늘의 메뉴 뽑기';
  if (recommendationMode === 'popular' && !supabaseClient) {
    showToast('Supabase 연결 후 누적 저장 순서가 실시간으로 반영돼요.');
  }
});

$('#resetButton').addEventListener('click', () => {
  selectedMood = 'all';
  document.querySelectorAll('.chip').forEach(chip => chip.classList.toggle('active', chip.dataset.value === 'all'));
  $('#budgetSelect').value = 'all';
  $('#timeSelect').value = 'all';
  recommendationMode = 'random';
  popularCursor = 0;
  document.querySelectorAll('.mode-button').forEach(button => button.classList.toggle('active', button.dataset.mode === 'random'));
  $('#pickButtonLabel').textContent = '오늘의 메뉴 뽑기';
  showToast('선택 조건을 초기화했어요.');
});

$('#budgetSelect').addEventListener('change', () => { popularCursor = 0; });
$('#timeSelect').addEventListener('change', () => { popularCursor = 0; });

pickButton.addEventListener('click', pickMenu);
document.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !['SELECT', 'BUTTON', 'A'].includes(document.activeElement.tagName)) pickMenu();
});

$('#heartButton').addEventListener('click', () => toggleMenuLike(currentMenu));

$('#quickGrid').addEventListener('click', event => {
  const likeButton = event.target.closest('.quick-like');
  if (likeButton) {
    const menu = menus.find(item => item.id === likeButton.dataset.likeMenu);
    toggleMenuLike(menu);
    return;
  }

  const selectButton = event.target.closest('.quick-select');
  if (!selectButton) return;
  const menu = menus.find(item => item.id === selectButton.dataset.menu);
  renderMenu(menu, 97);
  document.querySelector('.result-area').scrollIntoView({ behavior: 'smooth', block: 'center' });
});

$('#themeButton').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  showToast(document.body.classList.contains('dark') ? '저녁 모드로 바꿨어요.' : '밝은 모드로 바꿨어요.');
});

$('#shareButton').addEventListener('click', async () => {
  const text = `오늘 점심 후보: ${currentMenu.name}! 런치픽에서 같이 골라봐요.`;
  try {
    await navigator.clipboard.writeText(text);
    showToast('투표 초대 문구를 복사했어요!');
  } catch {
    showToast(text);
  }
});

setToday();
renderQuickCards();
syncMainHeart();
loadLikeCounts();

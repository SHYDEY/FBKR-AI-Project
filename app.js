const foods = [
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
  { id: 'dakgalbi-bowl', name: '닭갈비 덮밥', category: '한식', mood: ['spicy','hearty'], price: 11000, time: 30, emoji: '🍱', desc: '매콤한 닭갈비와 따끈한 밥을 한 그릇에 든든하게 담았어요.' },
  { id: 'bibimbap', name: '나물 비빔밥', category: '한식', mood: ['fresh','hearty'], price: 9500, time: 25, emoji: '🍚', desc: '다채로운 나물과 고소한 참기름을 쓱쓱 비벼 균형 있게 즐겨요.' },
  { id: 'chicken-curry', name: '치킨 카레', category: '일식', mood: ['warm','hearty'], price: 10500, time: 25, emoji: '🍛', desc: '부드러운 닭고기와 진한 카레 향이 기분 좋게 배를 채워줘요.' },
  { id: 'mul-naengmyeon', name: '시원한 물냉면', category: '한식', mood: ['fresh'], price: 11000, time: 25, emoji: '🍜', desc: '새콤한 육수와 쫄깃한 면으로 답답한 오후를 시원하게 열어요.' },
  { id: 'clam-kalguksu', name: '바지락 칼국수', category: '한식', mood: ['warm','hearty'], price: 10000, time: 35, emoji: '🍜', desc: '바지락의 시원한 감칠맛과 부드러운 면발이 속을 편안하게 해요.' },
  { id: 'beef-burrito', name: '소고기 부리토', category: '멕시칸', mood: ['spicy','hearty'], price: 13500, time: 25, emoji: '🌯', desc: '고기와 콩, 채소를 또띠아에 꽉 채운 간편하고 든든한 메뉴예요.' },
  { id: 'chicken-caesar-salad', name: '치킨 시저 샐러드', category: '샐러드', mood: ['fresh','hearty'], price: 12500, time: 20, emoji: '🥗', desc: '담백한 닭가슴살과 아삭한 로메인으로 가볍지만 든든하게 먹어요.' },
  { id: 'bulgogi-bowl', name: '불고기 덮밥', category: '한식', mood: ['hearty'], price: 11500, time: 25, emoji: '🍱', desc: '달큰한 불고기와 따끈한 밥의 익숙하고 든든한 조합이에요.' },
  { id: 'tteokbokki-set', name: '떡볶이 튀김 세트', category: '분식', mood: ['spicy'], price: 9000, time: 25, emoji: '🍢', desc: '매콤달콤 떡볶이와 바삭한 튀김으로 스트레스를 맛있게 풀어요.' }
];

const drinks = [
  { id: 'iced-americano', name: '아이스 아메리카노', category: '커피', mood: ['caffeine','cool'], price: 4500, time: 5, emoji: '🧊', desc: '깔끔하고 시원한 한 잔으로 나른한 오후를 또렷하게 깨워요.' },
  { id: 'cafe-latte', name: '카페 라테', category: '커피', mood: ['caffeine','warm'], price: 5200, time: 7, emoji: '☕', desc: '고소한 우유와 에스프레소가 부드럽게 어우러지는 편안한 한 잔.' },
  { id: 'vanilla-latte', name: '바닐라 라테', category: '커피', mood: ['caffeine','sweet'], price: 5800, time: 7, emoji: '🥛', desc: '은은한 바닐라 향과 달콤함으로 오후의 작은 보상을 즐겨요.' },
  { id: 'matcha-latte', name: '말차 라테', category: '티', mood: ['sweet','warm'], price: 6000, time: 8, emoji: '🍵', desc: '쌉싸름한 말차와 부드러운 우유가 차분한 여유를 선물해요.' },
  { id: 'grapefruit-ade', name: '자몽 에이드', category: '에이드', mood: ['cool','decaf'], price: 6200, time: 6, emoji: '🍹', desc: '톡 쏘는 탄산과 쌉싸름한 자몽이 입안을 상쾌하게 정리해줘요.' },
  { id: 'lemon-tea', name: '레몬 허니티', category: '티', mood: ['warm','decaf','sweet'], price: 5500, time: 7, emoji: '🍋', desc: '상큼한 레몬과 달콤한 꿀로 따뜻하고 편안하게 마무리해요.' },
  { id: 'black-sugar-bubble-tea', name: '흑당 버블티', category: '밀크티', mood: ['sweet','cool'], price: 6500, time: 10, emoji: '🧋', desc: '쫀득한 펄과 진한 흑당의 달콤함이 씹는 재미까지 채워줘요.' },
  { id: 'strawberry-smoothie', name: '딸기 스무디', category: '스무디', mood: ['sweet','cool','decaf'], price: 6800, time: 10, emoji: '🥤', desc: '새콤달콤한 딸기를 시원하고 부드럽게 갈아낸 기분 전환 한 잔.' },
  { id: 'yuzu-kombucha', name: '유자 콤부차', category: '콤부차', mood: ['cool','decaf'], price: 5000, time: 5, emoji: '🍊', desc: '산뜻한 유자 향과 가벼운 탄산으로 부담 없이 개운하게 즐겨요.' },
  { id: 'rooibos-tea', name: '루이보스 티', category: '티', mood: ['warm','decaf'], price: 4800, time: 6, emoji: '🫖', desc: '카페인 걱정 없이 은은한 향과 따뜻한 여유를 천천히 즐겨요.' }
];

const allItems = [...foods, ...drinks];
const LIKED_STORAGE_KEY = 'lunch-pick-liked-menus';
const TYPE_FILTERS = {
  food: {
    moods: [['all','✨','아무거나'],['warm','♨️','따뜻하게'],['fresh','🌿','산뜻하게'],['spicy','🔥','스트레스 풀게'],['hearty','💪','든든하게']],
    budgets: [['all','상관없어요'],['10000','1만원 이하'],['15000','1만 5천원 이하'],['20000','2만원 이하']],
    times: [['all','여유로워요'],['quick','30분 안에'],['normal','1시간 안에']],
    timeLimits: { quick: 30, normal: 60 }
  },
  drink: {
    moods: [['all','✨','아무거나'],['caffeine','⚡','카페인 충전'],['sweet','🍯','달달하게'],['cool','🧊','시원하게'],['decaf','🌙','논카페인']],
    budgets: [['all','상관없어요'],['5000','5천원 이하'],['7000','7천원 이하'],['10000','1만원 이하']],
    times: [['all','여유로워요'],['quick','10분 안에'],['normal','20분 안에']],
    timeLimits: { quick: 10, normal: 20 }
  }
};

let currentType = 'food';
let selectedMood = 'all';
let recommendationMode = 'random';
let popularCursor = 0;
let currentItem = foods[0];
let lastItemId = '';
let toastTimer;
let likedItemIds = loadLikedItemIds();
const likeCounts = new Map(allItems.map(item => [item.id, 0]));

const $ = (selector) => document.querySelector(selector);
const card = $('#menuCard');
const pickButton = $('#pickButton');
const supabaseConfig = window.LUNCH_PICK_SUPABASE || {};
const isSupabaseConfigured = Boolean(window.supabase && /^https:\/\/.+\.supabase\.co$/.test(supabaseConfig.url || '') && supabaseConfig.anonKey);
const supabaseClient = isSupabaseConfigured ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey) : null;

const formatPrice = (price) => `${price.toLocaleString('ko-KR')}원`;
const formatLikeCount = (count) => Number(count || 0).toLocaleString('ko-KR');
const getActiveItems = () => currentType === 'food' ? foods : drinks;

function loadLikedItemIds() {
  try {
    const stored = JSON.parse(localStorage.getItem(LIKED_STORAGE_KEY) || '[]');
    return new Set(Array.isArray(stored) ? stored : []);
  } catch {
    return new Set();
  }
}

function saveLikedItemIds() {
  localStorage.setItem(LIKED_STORAGE_KEY, JSON.stringify([...likedItemIds]));
}

function setToday() {
  const parts = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).formatToParts(new Date());
  $('#todayLabel').textContent = parts.map(part => part.value).join('').replace(/\s/g, ' ');
}

function renderFilterControls() {
  const filters = TYPE_FILTERS[currentType];
  $('#moodChips').innerHTML = filters.moods.map(([value, icon, label]) =>
    `<button class="chip${value === selectedMood ? ' active' : ''}" type="button" data-value="${value}"><span>${icon}</span> ${label}</button>`
  ).join('');
  $('#budgetSelect').innerHTML = filters.budgets.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
  $('#timeSelect').innerHTML = filters.times.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
}

function updatePickButtonLabel() {
  const labels = {
    food: recommendationMode === 'popular' ? '인기 메뉴 추천받기' : '오늘의 메뉴 뽑기',
    drink: recommendationMode === 'popular' ? '인기 음료 추천받기' : '후식 음료 뽑기'
  };
  $('#pickButtonLabel').textContent = labels[currentType];
}

function renderTypeCopy() {
  const isFood = currentType === 'food';
  $('#heroTitle').textContent = isFood ? '오늘 점심,' : '점심 후엔,';
  $('#heroEmphasis').textContent = isFood ? '뭐 먹지?' : '뭐 마시지?';
  $('#heroDescription').textContent = isFood ? '결정은 런치픽에게 맡기고, 맛있게 먹기만 하자.' : '맛있는 점심 뒤, 기분 좋은 한 잔까지 골라보자.';
  $('#filterTitle').textContent = isFood ? '오늘의 기분은?' : '어떤 한 잔이 필요해요?';
  $('#timeFilterLabel').textContent = isFood ? '식사 시간' : '픽업 시간';
  $('#resultStamp').innerHTML = isFood ? "TODAY'S<br />LUNCH" : "AFTER<br />LUNCH";
  $('#recommendationLabel').textContent = isFood ? '런치픽의 추천' : '런치픽의 후식 추천';
  $('#locationLabel').textContent = isFood ? '회사 근처' : '근처 카페';
  $('#quickTitle').textContent = isFood ? '지금 인기 있는 메뉴예요' : '지금 인기 있는 음료예요';
  $('#quickSubtitle').textContent = isFood ? '누적 저장 수가 높은 런치픽 인기 메뉴 순위' : '누적 저장 수가 높은 후식 음료 인기 순위';
  $('#teamHeading').textContent = isFood ? '점심 메뉴 후보를 공유하고 함께 투표해보세요.' : '후식 음료 후보를 공유하고 함께 골라보세요.';
  updatePickButtonLabel();
}

function getCandidates() {
  const budget = $('#budgetSelect').value;
  const timing = $('#timeSelect').value;
  const timeLimit = TYPE_FILTERS[currentType].timeLimits[timing];
  return getActiveItems().filter(item => {
    const moodOk = selectedMood === 'all' || item.mood.includes(selectedMood);
    const budgetOk = budget === 'all' || item.price <= Number(budget);
    const timeOk = timing === 'all' || item.time <= timeLimit;
    return moodOk && budgetOk && timeOk;
  });
}

function getItemsByPopularity(sourceItems = getActiveItems()) {
  return [...sourceItems].sort((a, b) => {
    const countDifference = (likeCounts.get(b.id) || 0) - (likeCounts.get(a.id) || 0);
    return countDifference || allItems.indexOf(a) - allItems.indexOf(b);
  });
}

function syncMainHeart() {
  const button = $('#heartButton');
  const liked = likedItemIds.has(currentItem.id);
  button.classList.toggle('liked', liked);
  button.setAttribute('aria-pressed', String(liked));
  button.setAttribute('aria-label', `${currentItem.name} ${liked ? '저장 취소' : '저장하기'}`);
  $('#heartCount').textContent = formatLikeCount(likeCounts.get(currentItem.id));
}

function setLikeButtonsBusy(itemId, busy) {
  if (currentItem.id === itemId) $('#heartButton').disabled = busy;
  const quickButton = document.querySelector(`.quick-like[data-like-item="${itemId}"]`);
  if (quickButton) quickButton.disabled = busy;
}

function renderItem(item, score = Math.floor(Math.random() * 8) + 92) {
  currentItem = item;
  $('#categoryPill').textContent = item.category;
  $('#menuName').textContent = item.name;
  $('#menuDescription').textContent = item.desc;
  $('#menuTime').textContent = `${item.time}분`;
  $('#menuPrice').textContent = formatPrice(item.price);
  $('#foodEmoji').textContent = item.emoji;
  $('#foodVisual').setAttribute('aria-label', `${item.name} 일러스트`);
  $('#foodVisual').classList.toggle('drink-visual', currentType === 'drink');
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

function pickItem() {
  const candidates = getCandidates();
  if (!candidates.length) {
    showToast('조건에 맞는 항목이 없어요. 필터를 조금 넓혀주세요!');
    return;
  }

  let selectedItem;
  if (recommendationMode === 'popular') {
    const rankedItems = getItemsByPopularity(candidates);
    selectedItem = rankedItems[popularCursor % rankedItems.length];
    popularCursor += 1;
  } else {
    let index = Math.floor(Math.random() * candidates.length);
    if (candidates.length > 1) {
      while (candidates[index].id === lastItemId) index = Math.floor(Math.random() * candidates.length);
    }
    selectedItem = candidates[index];
  }

  lastItemId = selectedItem.id;
  const pickedType = currentType;
  card.classList.remove('shuffling');
  void card.offsetWidth;
  card.classList.add('shuffling');
  setTimeout(() => {
    if (currentType === pickedType) renderItem(selectedItem);
  }, 210);
}

function renderQuickCards() {
  const quickItems = getItemsByPopularity().slice(0, 4);
  $('#quickGrid').innerHTML = quickItems.map((item, index) => {
    const liked = likedItemIds.has(item.id);
    return `
      <article class="quick-card" data-item-id="${item.id}">
        <span class="quick-rank" aria-label="인기 ${index + 1}위">${index + 1}</span>
        <button class="quick-select" type="button" data-item="${item.id}" aria-label="${item.name} 추천 보기">
          <span class="quick-emoji">${item.emoji}</span>
          <h3>${item.name}</h3>
          <p>${item.category} · ${item.time}분 · ${formatPrice(item.price)}</p>
          <span class="arrow">↗</span>
        </button>
        <button class="quick-like${liked ? ' liked' : ''}" type="button" data-like-item="${item.id}" aria-label="${item.name} ${liked ? '저장 취소' : '저장하기'}" aria-pressed="${liked}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z"/></svg>
          <span data-like-count>${formatLikeCount(likeCounts.get(item.id))}</span>
        </button>
      </article>`;
  }).join('');
}

async function loadLikeCounts() {
  if (!supabaseClient) return;
  const { data, error } = await supabaseClient.rpc('get_menu_like_counts');
  if (error) {
    console.error('Failed to load save counts:', error.message);
    showToast('저장 수를 불러오지 못했어요. Supabase 설정을 확인해주세요.');
    return;
  }
  (data || []).forEach(row => likeCounts.set(row.menu_id, Number(row.like_count)));
  renderQuickCards();
  syncMainHeart();
}

async function toggleItemLike(item) {
  if (!supabaseClient) {
    showToast('Supabase URL과 Publishable key를 먼저 설정해주세요.');
    return;
  }

  const shouldLike = !likedItemIds.has(item.id);
  setLikeButtonsBusy(item.id, true);
  const { data, error } = await supabaseClient.rpc('change_menu_like', {
    p_menu_id: item.id,
    p_delta: shouldLike ? 1 : -1
  });
  setLikeButtonsBusy(item.id, false);

  if (error) {
    console.error('Failed to update save count:', error.message);
    showToast('저장하지 못했어요. 잠시 후 다시 시도해주세요.');
    return;
  }

  likeCounts.set(item.id, Number(data));
  if (shouldLike) likedItemIds.add(item.id);
  else likedItemIds.delete(item.id);
  saveLikedItemIds();
  renderQuickCards();
  syncMainHeart();
  showToast(shouldLike ? `${item.name}, 저장했어요!` : `${item.name}, 저장을 취소했어요.`);
}

function switchType(type) {
  if (type === currentType) return;
  currentType = type;
  selectedMood = 'all';
  popularCursor = 0;
  lastItemId = '';
  currentItem = getActiveItems()[0];
  document.querySelectorAll('.type-button').forEach(button => {
    const active = button.dataset.type === currentType;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  renderFilterControls();
  renderTypeCopy();
  renderItem(currentItem, 98);
  renderQuickCards();
}

$('.item-type-switch').addEventListener('click', event => {
  const button = event.target.closest('.type-button');
  if (button) switchType(button.dataset.type);
});

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
  updatePickButtonLabel();
  if (recommendationMode === 'popular' && !supabaseClient) showToast('Supabase 연결 후 누적 저장 순서가 실시간으로 반영돼요.');
});

$('#resetButton').addEventListener('click', () => {
  selectedMood = 'all';
  recommendationMode = 'random';
  popularCursor = 0;
  renderFilterControls();
  document.querySelectorAll('.mode-button').forEach(button => button.classList.toggle('active', button.dataset.mode === 'random'));
  updatePickButtonLabel();
  showToast('선택 조건을 초기화했어요.');
});

$('#budgetSelect').addEventListener('change', () => { popularCursor = 0; });
$('#timeSelect').addEventListener('change', () => { popularCursor = 0; });
pickButton.addEventListener('click', pickItem);
document.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !['SELECT', 'BUTTON', 'A'].includes(document.activeElement.tagName)) pickItem();
});

$('#heartButton').addEventListener('click', () => toggleItemLike(currentItem));

$('#quickGrid').addEventListener('click', event => {
  const likeButton = event.target.closest('.quick-like');
  if (likeButton) {
    toggleItemLike(allItems.find(item => item.id === likeButton.dataset.likeItem));
    return;
  }
  const selectButton = event.target.closest('.quick-select');
  if (!selectButton) return;
  renderItem(allItems.find(item => item.id === selectButton.dataset.item), 97);
  document.querySelector('.result-area').scrollIntoView({ behavior: 'smooth', block: 'center' });
});

$('#themeButton').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  showToast(document.body.classList.contains('dark') ? '저녁 모드로 바꿨어요.' : '밝은 모드로 바꿨어요.');
});

$('#shareButton').addEventListener('click', async () => {
  const label = currentType === 'food' ? '오늘 점심 후보' : '오늘의 후식 음료';
  const text = `${label}: ${currentItem.name}! 런치픽에서 같이 골라봐요.`;
  try {
    await navigator.clipboard.writeText(text);
    showToast('투표 초대 문구를 복사했어요!');
  } catch {
    showToast(text);
  }
});

setToday();
renderFilterControls();
renderTypeCopy();
renderQuickCards();
syncMainHeart();
loadLikeCounts();

const menus = [
  { name: '돼지고기 김치찌개', category: '한식', mood: ['warm','spicy','hearty'], price: 9000, time: 25, emoji: '🍲', desc: '칼칼한 국물에 푹 익은 김치, 실패 없는 든든한 한 끼예요.' },
  { name: '바삭한 돈카츠', category: '일식', mood: ['hearty'], price: 12000, time: 35, emoji: '🍛', desc: '겉은 바삭하고 속은 촉촉한, 기분 좋은 식감의 정석이에요.' },
  { name: '직화 제육볶음', category: '한식', mood: ['spicy','hearty'], price: 10000, time: 30, emoji: '🍖', desc: '불향 가득한 매콤달콤 제육으로 오후 에너지를 충전해요.' },
  { name: '소고기 쌀국수', category: '아시안', mood: ['warm','fresh'], price: 11000, time: 25, emoji: '🍜', desc: '맑고 향긋한 국물과 부드러운 소고기가 편안하게 어울려요.' },
  { name: '연어 포케', category: '샐러드', mood: ['fresh'], price: 13000, time: 20, emoji: '🥗', desc: '신선한 연어와 채소, 톡톡 씹히는 곡물로 산뜻하고 든든해요.' },
  { name: '마라탕', category: '중식', mood: ['spicy','warm'], price: 14000, time: 35, emoji: '🥘', desc: '얼얼하고 화끈한 국물 한 입이면 쌓인 스트레스가 사르르.' },
  { name: '들기름 메밀국수', category: '한식', mood: ['fresh'], price: 10000, time: 20, emoji: '🍝', desc: '고소한 들기름 향과 탱글한 메밀면이 깔끔하게 입맛을 살려줘요.' },
  { name: '수제 치즈버거', category: '양식', mood: ['hearty'], price: 15000, time: 30, emoji: '🍔', desc: '육즙 가득 패티와 녹진한 치즈로 오늘만큼은 제대로 즐겨요.' },
  { name: '순두부찌개', category: '한식', mood: ['warm','spicy'], price: 8500, time: 25, emoji: '🍲', desc: '몽글몽글 순두부와 얼큰한 국물이 속을 따뜻하게 채워줘요.' },
  { name: '새우 크림 파스타', category: '양식', mood: ['hearty'], price: 16000, time: 45, emoji: '🍝', desc: '탱글한 새우와 부드러운 크림소스로 여유로운 점심을 즐겨요.' },
  { name: '초밥 모둠', category: '일식', mood: ['fresh'], price: 19000, time: 45, emoji: '🍣', desc: '한 점씩 골라 먹는 재미와 신선함이 있는 기분 좋은 한 끼예요.' },
  { name: '닭갈비 덮밥', category: '한식', mood: ['spicy','hearty'], price: 11000, time: 30, emoji: '🍱', desc: '매콤한 닭갈비와 따끈한 밥을 한 그릇에 든든하게 담았어요.' }
];

let selectedMood = 'all';
let currentMenu = menus[0];
let lastIndex = -1;
let toastTimer;

const $ = (selector) => document.querySelector(selector);
const card = $('#menuCard');
const pickButton = $('#pickButton');

const formatPrice = (price) => `${price.toLocaleString('ko-KR')}원`;

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
  $('#heartButton').classList.remove('liked');
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
  let index = Math.floor(Math.random() * candidates.length);
  if (candidates.length > 1) {
    while (menus.indexOf(candidates[index]) === lastIndex) index = Math.floor(Math.random() * candidates.length);
  }
  lastIndex = menus.indexOf(candidates[index]);
  card.classList.remove('shuffling');
  void card.offsetWidth;
  card.classList.add('shuffling');
  setTimeout(() => renderMenu(candidates[index]), 210);
}

function renderQuickCards() {
  const quickMenus = [menus[1], menus[4], menus[5], menus[6]];
  $('#quickGrid').innerHTML = quickMenus.map(menu => `
    <button class="quick-card" type="button" data-menu="${menu.name}" aria-label="${menu.name} 추천 보기">
      <span class="quick-emoji">${menu.emoji}</span>
      <h3>${menu.name}</h3>
      <p>${menu.category} · ${menu.time}분 · ${formatPrice(menu.price)}</p>
      <span class="arrow">↗</span>
    </button>`).join('');
}

$('#moodChips').addEventListener('click', event => {
  const button = event.target.closest('.chip');
  if (!button) return;
  document.querySelectorAll('.chip').forEach(chip => chip.classList.remove('active'));
  button.classList.add('active');
  selectedMood = button.dataset.value;
});

$('#resetButton').addEventListener('click', () => {
  selectedMood = 'all';
  document.querySelectorAll('.chip').forEach(chip => chip.classList.toggle('active', chip.dataset.value === 'all'));
  $('#budgetSelect').value = 'all';
  $('#timeSelect').value = 'all';
  showToast('선택 조건을 초기화했어요.');
});

pickButton.addEventListener('click', pickMenu);
document.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !['SELECT', 'BUTTON', 'A'].includes(document.activeElement.tagName)) pickMenu();
});

$('#heartButton').addEventListener('click', event => {
  const button = event.currentTarget;
  button.classList.toggle('liked');
  showToast(button.classList.contains('liked') ? `${currentMenu.name}, 찜했어요!` : '찜 목록에서 뺐어요.');
});

$('#quickGrid').addEventListener('click', event => {
  const button = event.target.closest('.quick-card');
  if (!button) return;
  const menu = menus.find(item => item.name === button.dataset.menu);
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

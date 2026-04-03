const state = {
  activeTemplate: 'question',
  question: {
    firstCharacter: '',
    featureRequest: '',
    reasonStarted: '',
    messageToOps: '',
    freeSpace: ''
  },
  profile: {
    name: '',
    xId: '',
    zetaHistory: '',
    creatorId: '',
    nickname: '',
    favoriteThing: '',
    oshi1Name: '',
    oshi2Name: '',
    oshi3Name: '',
    oshi1Image: '',
    oshi2Image: '',
    oshi3Image: ''
  }
};

const tabs = document.querySelectorAll('.tab');
const questionForm = document.getElementById('question-form');
const profileForm = document.getElementById('profile-form');
const questionPreview = document.getElementById('question-preview');
const profilePreview = document.getElementById('profile-preview');
const resetBtn = document.getElementById('reset-btn');
const downloadBtn = document.getElementById('download-btn');

function setTemplate(template) {
  state.activeTemplate = template;
  tabs.forEach((tab) => {
    const active = tab.dataset.template === template;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  questionForm.classList.toggle('hidden', template !== 'question');
  profileForm.classList.toggle('hidden', template !== 'profile');
  questionPreview.classList.toggle('hidden', template !== 'question');
  profilePreview.classList.toggle('hidden', template !== 'profile');
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => setTemplate(tab.dataset.template));
});

function applyText(previewRoot, data) {
  previewRoot.querySelectorAll('[data-field]').forEach((node) => {
    const value = data[node.dataset.field] || '';
    node.textContent = value;
  });
}

function applyImages() {
  [1,2,3].forEach((n) => {
    const slot = profilePreview.querySelector(`.slot${n}`);
    const img = slot.querySelector('img');
    const src = state.profile[`oshi${n}Image`];
    if (src) {
      img.src = src;
      slot.classList.add('has-image');
    } else {
      img.removeAttribute('src');
      slot.classList.remove('has-image');
    }
  });
}

questionForm.addEventListener('input', (event) => {
  const { name, value } = event.target;
  state.question[name] = value;
  applyText(questionPreview, state.question);
  persist();
});

profileForm.addEventListener('input', (event) => {
  const { name, value, type, files } = event.target;
  if (type === 'file') {
    const file = files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.profile[name] = reader.result;
      applyImages();
      persist();
    };
    reader.readAsDataURL(file);
    return;
  }
  state.profile[name] = value;
  applyText(profilePreview, state.profile);
  persist();
});

function persist() {
  localStorage.setItem('zeta-card-maker', JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem('zeta-card-maker');
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    Object.assign(state.question, saved.question || {});
    Object.assign(state.profile, saved.profile || {});
    state.activeTemplate = saved.activeTemplate || 'question';
  } catch (_) {}
}

function fillForms() {
  Object.entries(state.question).forEach(([key, value]) => {
    const el = questionForm.elements.namedItem(key);
    if (el) el.value = value;
  });
  Object.entries(state.profile).forEach(([key, value]) => {
    const el = profileForm.elements.namedItem(key);
    if (el && el.type !== 'file') el.value = value;
  });
}

resetBtn.addEventListener('click', () => {
  if (!confirm('入力内容を消しますか？')) return;
  localStorage.removeItem('zeta-card-maker');
  window.location.reload();
});

downloadBtn.addEventListener('click', async () => {
  const target = state.activeTemplate === 'question' ? questionPreview : profilePreview;
  const canvas = await html2canvas(target, {
    useCORS: true,
    backgroundColor: null,
    scale: 2
  });
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `zeta-card-${state.activeTemplate}.png`;
  link.click();
});

loadState();
fillForms();
applyText(questionPreview, state.question);
applyText(profilePreview, state.profile);
applyImages();
setTemplate(state.activeTemplate);

const state = {
  activeTemplate: 'profile',
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
    profileImage: '',
    oshi1DescFontSize: 14,
    oshi2DescFontSize: 14,
    oshi3DescFontSize: 14,
    oshi1Name: '',
    oshi2Name: '',
    oshi3Name: '',
    oshi1Desc: '',
    oshi2Desc: '',
    oshi3Desc: '',
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

  if (previewRoot === questionPreview) {
    fitQuestionText();
  } else if (previewRoot === profilePreview) {
    fitProfileText();
  }
}

function fitQuestionText() {
  const fields = [
    { selector: '.q-first', max: 28 },
    { selector: '.q-feature', max: 28 },
    { selector: '.q-reason', max: 28 },
    { selector: '.q-message', max: 28 },
    { selector: '.q-free', max: 28 }
  ];

  fields.forEach(({ selector, max }) => {
    const node = questionPreview.querySelector(selector);
    if (!node) return;

    // まず最大サイズを設定
    let fontSize = max;
    node.style.fontSize = `${fontSize}px`;

    // 横幅または高さにはみ出さないまで縮小
    while (fontSize > 8 && (node.scrollHeight > node.clientHeight + 2 || node.scrollWidth > node.clientWidth + 2)) {
      fontSize -= 1;
      node.style.fontSize = `${fontSize}px`;
    }
  });
}

function fitProfileText() {
  const fields = [
    { selector: '.p-name', max: 22 },
    { selector: '.p-xid', max: 22 },
    { selector: '.p-history', max: 22 },
    { selector: '.p-creator', max: 22 },
    { selector: '.p-nickname', max: 22 },
    { selector: '.p-favorite', max: 22 },
    { selector: '.overlay.p-oshi1', max: 20 },
    { selector: '.overlay.p-oshi2', max: 20 },
    { selector: '.overlay.p-oshi3', max: 20 },
    { selector: '.overlay.p-oshi1-desc', max: 14 },
    { selector: '.overlay.p-oshi2-desc', max: 14 },
    { selector: '.overlay.p-oshi3-desc', max: 14 }
  ];

  fields.forEach(({ selector, max }) => {
    const node = profilePreview.querySelector(selector);
    if (!node) return;

    // まず最大サイズを設定
    let fontSize = max;
    node.style.fontSize = `${fontSize}px`;

    // 横幅または高さにはみ出さないまで縮小
    while (fontSize > 8 && (node.scrollHeight > node.clientHeight + 2 || node.scrollWidth > node.clientWidth + 2)) {
      fontSize -= 1;
      node.style.fontSize = `${fontSize}px`;
    }
  });
}

function getSlotDimensions(slot) {
  if (!slot) return { width: 1, height: 1 };
  const rect = slot.getBoundingClientRect();
  if (rect.width > 1 && rect.height > 1) {
    // 高解像度でトリミングするため、実際のサイズの2倍を返す
    return { width: rect.width * 2, height: rect.height * 2 };
  }

  const baseImg = profilePreview.querySelector('.base-image');
  const naturalWidth = baseImg?.naturalWidth || 1024;
  const naturalHeight = baseImg?.naturalHeight || 1448;

  if (slot.classList.contains('profile-slot')) {
    return { width: naturalWidth * 0.20 * 2, height: naturalHeight * 0.15 * 2 };
  }
  if (slot.classList.contains('slot1') || slot.classList.contains('slot2') || slot.classList.contains('slot3')) {
    return { width: naturalWidth * 0.245 * 2, height: naturalHeight * 0.165 * 2 };
  }

  return { width: (rect.width || 1) * 2, height: (rect.height || 1) * 2 };
}

function createCoverDataURL(src, width, height) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(width));
      canvas.height = Math.max(1, Math.floor(height));
      const ctx = canvas.getContext('2d');
      const imgRatio = img.width / img.height;
      const boxRatio = canvas.width / canvas.height;

      let sx, sy, sw, sh;
      if (imgRatio > boxRatio) {
        sh = img.height;
        sw = sh * boxRatio;
        sx = (img.width - sw) / 2;
        sy = 0;
      } else {
        sw = img.width;
        sh = sw / boxRatio;
        sx = 0;
        sy = (img.height - sh) / 2;
      }

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = src;
  });
}

async function applyCoverImage(name, rawSrc) {
  const slotSelector = name === 'profileImage' ? '.profile-slot' : name === 'oshi1Image' ? '.slot1' : name === 'oshi2Image' ? '.slot2' : '.slot3';
  const slot = profilePreview.querySelector(slotSelector);
  const dims = getSlotDimensions(slot);
  const processed = await createCoverDataURL(rawSrc, dims.width, dims.height);
  state.profile[name] = processed;
  persist();
  applyImages();
}

function applyImages() {
  const profileSlot = profilePreview.querySelector('.profile-slot');
  const profileImg = profileSlot.querySelector('img');
  const profileSrc = state.profile.profileImage;
  if (profileSrc) {
    profileImg.src = profileSrc;
    profileSlot.classList.add('has-image');
  } else {
    profileImg.removeAttribute('src');
    profileSlot.classList.remove('has-image');
  }
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

profileForm.addEventListener('input', async (event) => {
  const { name, value, type, files } = event.target;
  if (type === 'file') {
    const file = files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      await applyCoverImage(name, reader.result);
    };
    reader.readAsDataURL(file);
    return;
  }
  if (name === 'oshi1DescFontSize' || name === 'oshi2DescFontSize' || name === 'oshi3DescFontSize') {
    const size = Number(value) || 14;
    state.profile[name] = size;
    document.getElementById(`${name}-label`).textContent = `${size}px`;
    applyOshiDescFontSize();
    persist();
    return;
  }

  state.profile[name] = value;
  applyText(profilePreview, state.profile);
  persist();
});

function applyOshiDescFontSize() {
  const sizes = [1, 2, 3].map((n) => state.profile[`oshi${n}DescFontSize`] || 14);
  ['p-oshi1-desc', 'p-oshi2-desc', 'p-oshi3-desc'].forEach((clazz, i) => {
    const size = `${sizes[i]}px`;
    document.querySelectorAll(`.${clazz}`).forEach((el) => {
      el.style.fontSize = size;
    });
  });
}

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
applyOshiDescFontSize();
setTemplate(state.activeTemplate);

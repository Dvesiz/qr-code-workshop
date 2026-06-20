import './styles/main.css';
import { downloadCanvasPng, generateQrCanvas } from './modules/generator.js';
import { decodeQrFromFile } from './modules/parser.js';
import { buildWifiQrText } from './modules/wifi.js';
import { loadImageFromFile } from './utils/canvas.js';

const tabs = [...document.querySelectorAll('[data-tab]')];
const panels = [...document.querySelectorAll('[data-panel]')];
const themeToggle = document.querySelector('[data-theme-toggle]');
const toast = document.querySelector('[data-toast]');
const previewDialog = document.querySelector('[data-preview-dialog]');
const previewBody = document.querySelector('[data-preview-body]');
const previewClose = document.querySelector('[data-preview-close]');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const themeColors = {
  light: '#f6f8f9',
  dark: '#081113'
};

let generatorCanvas = null;
let wifiCanvas = null;
let lastPreviewTrigger = null;

function getActiveTab() {
  const hash = window.location.hash.replace('#', '');
  return ['generator', 'parser', 'wifi'].includes(hash) ? hash : 'generator';
}

function setActiveTab(tabName) {
  tabs.forEach((tab) => {
    const isActive = tab.dataset.tab === tabName;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  });

  panels.forEach((panel) => {
    const isActive = panel.dataset.panel === tabName;
    panel.classList.toggle('is-active', isActive);
    panel.hidden = !isActive;
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(showToast.showTimeoutId);
  window.clearTimeout(showToast.hideTimeoutId);

  showToast.showTimeoutId = window.setTimeout(() => {
    toast.classList.add('is-visible');
  }, 0);

  showToast.hideTimeoutId = window.setTimeout(() => {
    toast.classList.remove('is-visible');
    showToast.hideTimeoutId = window.setTimeout(() => {
      toast.hidden = true;
    }, 260);
  }, 2600);
}

showToast.showTimeoutId = 0;
showToast.hideTimeoutId = 0;

function setStatus(element, message, type = 'neutral') {
  element.textContent = message;
  element.dataset.type = type;
}

function renderCanvas(container, canvas) {
  container.replaceChildren(canvas);
  canvas.setAttribute('aria-label', '生成的二维码');
  canvas.setAttribute('role', 'button');
  canvas.setAttribute('tabindex', '0');
  canvas.title = '点击放大预览';

  canvas.addEventListener('click', () => openPreview(canvas, canvas));
  canvas.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPreview(canvas, canvas);
    }
  });
}

function openPreview(canvas, triggerElement = null) {
  lastPreviewTrigger = triggerElement;
  const image = document.createElement('img');
  image.src = canvas.toDataURL('image/png');
  image.alt = '二维码放大预览';
  previewBody.replaceChildren(image);
  previewDialog.showModal();
  previewClose.focus();
}

function initTabs() {
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      window.location.hash = tab.dataset.tab;
    });

    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        return;
      }

      event.preventDefault();
      const lastIndex = tabs.length - 1;
      const nextIndex = {
        ArrowLeft: index === 0 ? lastIndex : index - 1,
        ArrowRight: index === lastIndex ? 0 : index + 1,
        Home: 0,
        End: lastIndex
      }[event.key];

      tabs[nextIndex].focus();
      window.location.hash = tabs[nextIndex].dataset.tab;
    });
  });

  window.addEventListener('hashchange', () => setActiveTab(getActiveTab()));
  setActiveTab(getActiveTab());
}

function updateThemeColor(theme) {
  themeColorMeta?.setAttribute('content', themeColors[theme] || themeColors.light);
}

function syncThemeButton(theme) {
  themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
  themeToggle.textContent = theme === 'dark' ? '亮色模式' : '深色模式';
}

function initTheme() {
  const currentTheme = document.documentElement.dataset.theme || 'light';
  syncThemeButton(currentTheme);
  updateThemeColor(currentTheme);

  themeToggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('qr-workshop-theme', nextTheme);
    syncThemeButton(nextTheme);
    updateThemeColor(nextTheme);
  });
}

async function getOptionalLogo(fileInput) {
  const file = fileInput.files?.[0];
  return file ? loadImageFromFile(file) : null;
}

function initGenerator() {
  const form = document.querySelector('[data-generator-form]');
  const result = document.querySelector('[data-generator-result]');
  const status = document.querySelector('[data-generator-status]');
  const downloadButton = document.querySelector('[data-download-generator]');
  const sizeSelect = form.elements.size;
  const customSizeInput = form.elements.customSize;

  sizeSelect.addEventListener('change', () => {
    const isCustom = sizeSelect.value === 'custom';
    customSizeInput.disabled = !isCustom;
    customSizeInput.required = isCustom;
    if (!isCustom) {
      customSizeInput.value = '';
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus(status, '正在生成二维码...', 'loading');
    downloadButton.disabled = true;

    try {
      const formData = new FormData(form);
      const logoImage = await getOptionalLogo(form.elements.logo);
      const size = formData.get('size') === 'custom'
        ? formData.get('customSize')
        : formData.get('size');
      generatorCanvas = await generateQrCanvas({
        text: formData.get('text'),
        size,
        foregroundColor: formData.get('foregroundColor'),
        backgroundColor: formData.get('backgroundColor'),
        logoImage
      });

      renderCanvas(result, generatorCanvas);
      downloadButton.disabled = false;
      setStatus(status, '二维码已生成，可下载 PNG。', 'success');
    } catch (error) {
      generatorCanvas = null;
      setStatus(status, error.message, 'error');
      showToast(error.message);
    }
  });

  downloadButton.addEventListener('click', () => {
    if (generatorCanvas) {
      downloadCanvasPng(generatorCanvas, 'qr-code-workshop.png');
    }
  });
}

function initPreview() {
  previewClose.addEventListener('click', () => previewDialog.close());
  previewDialog.addEventListener('click', (event) => {
    if (event.target === previewDialog) {
      previewDialog.close();
    }
  });
  previewDialog.addEventListener('close', () => {
    previewBody.replaceChildren();
    lastPreviewTrigger?.focus();
    lastPreviewTrigger = null;
  });
}

function renderWifiHint(container, wifi) {
  if (!wifi) {
    container.hidden = true;
    container.replaceChildren();
    return;
  }

  container.hidden = false;
  container.replaceChildren();

  const title = document.createElement('strong');
  title.textContent = '检测到 WiFi 配置';

  const ssid = document.createElement('span');
  ssid.textContent = `SSID：${wifi.ssid || '未提供'}`;

  const encryption = document.createElement('span');
  encryption.textContent = `加密：${wifi.encryption}`;

  const hidden = document.createElement('span');
  hidden.textContent = `隐藏网络：${wifi.hidden ? '是' : '否'}`;

  container.append(title, ssid, encryption, hidden);
}

async function handleParserFile(file) {
  const status = document.querySelector('[data-parser-status]');
  const output = document.querySelector('[data-parser-output]');
  const copyButton = document.querySelector('[data-copy-parser]');
  const wifiHint = document.querySelector('[data-parser-wifi]');

  setStatus(status, '正在解析图片...', 'loading');
  output.value = '';
  copyButton.disabled = true;
  renderWifiHint(wifiHint, null);

  try {
    const decoded = await decodeQrFromFile(file);

    if (!decoded) {
      setStatus(status, '未识别到二维码，请换一张更清晰的图片。', 'error');
      return;
    }

    output.value = decoded.text;
    copyButton.disabled = false;
    renderWifiHint(wifiHint, decoded.wifi);
    setStatus(status, '解析成功，结果已在下方显示。', 'success');
  } catch (error) {
    setStatus(status, error.message, 'error');
    showToast(error.message);
  }
}

function initParser() {
  const fileInput = document.querySelector('[data-parser-file]');
  const dropzone = document.querySelector('[data-dropzone]');
  const output = document.querySelector('[data-parser-output]');
  const copyButton = document.querySelector('[data-copy-parser]');
  let dragDepth = 0;

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) {
      handleParserFile(file);
    }
  });

  dropzone.addEventListener('dragenter', (event) => {
    event.preventDefault();
    dragDepth += 1;
    dropzone.classList.add('is-dragging');
  });

  dropzone.addEventListener('dragover', (event) => {
    event.preventDefault();
  });

  dropzone.addEventListener('dragleave', (event) => {
    event.preventDefault();
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) {
      dropzone.classList.remove('is-dragging');
    }
  });

  dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    dragDepth = 0;
    dropzone.classList.remove('is-dragging');

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleParserFile(file);
    }
  });

  copyButton.addEventListener('click', async () => {
    await navigator.clipboard.writeText(output.value);
    showToast('解析结果已复制');
  });
}

function getWifiFormValues(form) {
  const formData = new FormData(form);

  return {
    ssid: formData.get('ssid'),
    encryption: formData.get('encryption'),
    password: formData.get('password'),
    hidden: formData.get('hidden') === 'on'
  };
}

function initWifi() {
  const form = document.querySelector('[data-wifi-form]');
  const result = document.querySelector('[data-wifi-result]');
  const status = document.querySelector('[data-wifi-status]');
  const wifiText = document.querySelector('[data-wifi-text]');
  const downloadButton = document.querySelector('[data-download-wifi]');

  form.addEventListener('input', () => {
    try {
      wifiText.textContent = buildWifiQrText(getWifiFormValues(form));
    } catch {
      wifiText.textContent = '填写表单后自动生成';
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus(status, '正在生成 WiFi 二维码...', 'loading');
    downloadButton.disabled = true;

    try {
      const text = buildWifiQrText(getWifiFormValues(form));
      wifiText.textContent = text;
      wifiCanvas = await generateQrCanvas({ text, size: 300 });
      renderCanvas(result, wifiCanvas);
      downloadButton.disabled = false;
      setStatus(status, 'WiFi 二维码已生成。', 'success');
    } catch (error) {
      wifiCanvas = null;
      setStatus(status, error.message, 'error');
      showToast(error.message);
    }
  });

  downloadButton.addEventListener('click', () => {
    if (wifiCanvas) {
      downloadCanvasPng(wifiCanvas, 'wifi-qr-code.png');
    }
  });
}

initTabs();
initTheme();
initPreview();
initGenerator();
initParser();
initWifi();

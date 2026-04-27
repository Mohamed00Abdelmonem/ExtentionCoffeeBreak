/**
 * Popup Script for Eye Break Helper
 * Handles settings UI and user interactions
 */

// DOM Elements
const enableToggle = document.getElementById('enableToggle');
const intervalSlider = document.getElementById('intervalSlider');
const intervalValue = document.getElementById('intervalValue');
const presetButtons = document.querySelectorAll('.preset-btn');
const testButton = document.getElementById('testButton');
const statusMessage = document.getElementById('statusMessage');
const themeToggle = document.getElementById('themeToggle');
const langToggle = document.getElementById('langToggle');

const translations = {
  en: {
    title: 'Coffee Break',
    subtitle: 'Rest your eyes regularly',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    arabic: 'Arabic',
    english: 'English',
    enableReminders: 'Enable Reminders',
    enableDesc: 'Turn reminders on/off',
    intervalTitle: 'Interval',
    intervalDesc: 'Frequency in minutes',
    preset5: '5 min',
    preset15: '15 min',
    preset30: '30 min',
    whyTitle: 'Why Eye Breaks?',
    whyText: 'Every 20 min, look 20 ft away for 20 sec (20-20-20 rule)',
    testReminder: 'Test Reminder',
    testing: 'Testing...',
    footerText: 'Made with coffee for your eyes',
    enabled: '✓ Reminders enabled',
    disabled: '✗ Reminders disabled',
    intervalSet: '✓ Interval set to {value} minutes',
    reminderTriggered: '✓ Reminder triggered!',
    bgError: '✗ Could not contact background service'
  },
  ar: {
    title: 'استراحة القهوة',
    subtitle: 'أرح عينيك بانتظام',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    arabic: 'العربية',
    english: 'English',
    enableReminders: 'تفعيل التذكيرات',
    enableDesc: 'تشغيل أو إيقاف التذكيرات',
    intervalTitle: 'الفترة',
    intervalDesc: 'المدة بالدقائق',
    preset5: '5 دقائق',
    preset15: '15 دقيقة',
    preset30: '30 دقيقة',
    whyTitle: 'لماذا استراحة العين؟',
    whyText: 'كل 20 دقيقة، انظر لمسافة 20 قدمًا لمدة 20 ثانية',
    testReminder: 'اختبار التذكير',
    testing: 'جارٍ الاختبار...',
    footerText: 'صنع بالقهوة من أجل عينيك',
    enabled: '✓ تم تفعيل التذكيرات',
    disabled: '✗ تم إيقاف التذكيرات',
    intervalSet: '✓ تم ضبط الفترة إلى {value} دقيقة',
    reminderTriggered: '✓ تم تشغيل التذكير!',
    bgError: '✗ تعذر الاتصال بخدمة الخلفية'
  }
};

let currentTheme = 'dark';
let currentLang = 'en';

/**
 * Initialize popup on load
 */
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  loadUiPreferences();
  setupEventListeners();
});

function loadUiPreferences() {
  chrome.storage.sync.get(['uiTheme', 'uiLang'], (result) => {
    currentTheme = result.uiTheme === 'light' ? 'light' : 'dark';
    currentLang = result.uiLang === 'ar' ? 'ar' : 'en';

    applyTheme(currentTheme);
    applyLanguage(currentLang);
    syncUiButtons();
  });
}

/**
 * Load current settings from storage
 */
function loadSettings() {
  chrome.storage.sync.get(['isEnabled', 'interval'], (result) => {
    const isEnabled = result.isEnabled !== undefined ? result.isEnabled : true;
    const interval = result.interval || 5;
    
    enableToggle.checked = isEnabled;
    intervalSlider.value = interval;
    intervalValue.textContent = interval;
    
    // Update preset button styling
    updatePresetButtons(interval);
    
    // Disable slider if feature is disabled
    intervalSlider.disabled = !isEnabled;
    presetButtons.forEach(btn => {
      btn.disabled = !isEnabled;
    });
  });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
    syncUiButtons();
    chrome.storage.sync.set({ uiTheme: currentTheme });
  });

  langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    applyLanguage(currentLang);
    syncUiButtons();
    chrome.storage.sync.set({ uiLang: currentLang });
  });

  // Enable/Disable toggle
  enableToggle.addEventListener('change', (e) => {
    const isEnabled = e.target.checked;
    chrome.storage.sync.set({ isEnabled }, () => {
      console.log('Feature toggled:', isEnabled);
      
      // Update UI
      intervalSlider.disabled = !isEnabled;
      presetButtons.forEach(btn => {
        btn.disabled = !isEnabled;
      });
      
      showStatusMessage(
        isEnabled ? t('enabled') : t('disabled'),
        isEnabled ? 'success' : 'info'
      );
    });
  });
  
  // Interval slider
  intervalSlider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    intervalValue.textContent = value;
    updatePresetButtons(value);
  });
  
  // Interval slider change (debounced)
  intervalSlider.addEventListener('change', (e) => {
    const value = parseInt(e.target.value);
    chrome.storage.sync.set({ interval: value }, () => {
      console.log('Interval changed to:', value, 'minutes');
      showStatusMessage(t('intervalSet').replace('{value}', value), 'success');
    });
  });
  
  // Preset buttons
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const value = parseInt(btn.getAttribute('data-value'));
      intervalSlider.value = value;
      intervalValue.textContent = value;
      updatePresetButtons(value);
      
      chrome.storage.sync.set({ interval: value }, () => {
        console.log('Interval preset set to:', value, 'minutes');
        showStatusMessage(t('intervalSet').replace('{value}', value), 'success');
      });
    });
  });
  
  // Test button
  testButton.addEventListener('click', () => {
    testButton.disabled = true;
    testButton.classList.add('btn-loading');
    testButton.innerHTML = `<span class="btn-icon">⏱</span><span class="btn-text">${t('testing')}</span>`;
    
    chrome.runtime.sendMessage({ action: 'testBreak' }, (response) => {
      // Re-enable after a moment
      setTimeout(() => {
        testButton.disabled = false;
        testButton.classList.remove('btn-loading');
        testButton.innerHTML = `<span class="btn-icon">▶</span><span class="btn-text">${t('testReminder')}</span>`;

        if (chrome.runtime.lastError) {
          showStatusMessage(t('bgError'), 'error');
          return;
        }

        if (response && response.ok) {
          showStatusMessage(t('reminderTriggered'), 'success');
        } else {
          showStatusMessage(`✗ ${response?.reason || 'Could not show reminder on this tab'}`, 'error');
        }
      }, 1000);
    });
  });
}

function t(key) {
  return translations[currentLang][key] || translations.en[key] || key;
}

function applyTheme(theme) {
  document.documentElement.classList.toggle('light', theme === 'light');
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

function applyLanguage(lang) {
  document.documentElement.lang = lang === 'ar' ? 'ar' : 'en';
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key === 'darkMode') {
      el.textContent = currentTheme === 'dark' ? t('lightMode') : t('darkMode');
      return;
    }

    if (key === 'arabic') {
      el.textContent = currentLang === 'en' ? t('arabic') : t('english');
      return;
    }

    el.textContent = t(key);
  });

  document.querySelectorAll('[data-i18n-btn]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n-btn'));
  });

  syncUiButtons();
}

function syncUiButtons() {
  themeToggle.classList.toggle('is-active', currentTheme === 'light');
  langToggle.classList.toggle('is-active', currentLang === 'ar');
  themeToggle.setAttribute('aria-pressed', currentTheme === 'light' ? 'true' : 'false');
  langToggle.setAttribute('aria-pressed', currentLang === 'ar' ? 'true' : 'false');
  themeToggle.querySelector('.control-label').textContent = currentTheme === 'dark' ? t('lightMode') : t('darkMode');
  langToggle.querySelector('.control-label').textContent = currentLang === 'en' ? t('arabic') : t('english');
}

/**
 * Update preset button styling based on current value
 */
function updatePresetButtons(currentValue) {
  presetButtons.forEach(btn => {
    const value = parseInt(btn.getAttribute('data-value'));
    if (value === currentValue) {
      btn.classList.add('preset-btn-active');
    } else {
      btn.classList.remove('preset-btn-active');
    }
  });
}

/**
 * Show status message to user
 */
function showStatusMessage(message, type = 'info') {
  statusMessage.textContent = message;
  statusMessage.className = `status-message status-${type}`;
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    statusMessage.textContent = '';
    statusMessage.className = 'status-message';
  }, 3000);
}

console.log('Popup script loaded!');

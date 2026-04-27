/**
 * Background Service Worker (Manifest V3)
 * Triggers fullscreen break video overlays via content-script messaging.
 */

const SHOW_OVERLAY_ACTION = 'showAutoBreakVideo';
const MESSAGE_THROTTLE_MS = 2500;
const ALARM_NAME = 'eyeBreakReminder';
const DEFAULT_SETTINGS = {
  isEnabled: true,
  interval: 5
};

// Track recent sends to avoid duplicate overlays from clustered tab events.
const lastMessageAtByTabId = new Map();

chrome.runtime.onInstalled.addListener(async () => {
  console.log('Eye Break Helper installed/updated');

  const settings = await getSettings();
  await chrome.storage.sync.set(settings);
  await setupAlarm(settings);

  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    await sendOverlayMessageToTab(tab, { force: true });
  }
});

// Show overlay when a page finishes loading.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') {
    return;
  }

  void maybeTriggerForTab(tab);
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAME) {
    return;
  }

  const settings = await getSettings();
  if (!settings.isEnabled) {
    return;
  }

  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    await sendOverlayMessageToTab(tab, { force: true });
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'sync') {
    return;
  }

  if (changes.isEnabled || changes.interval) {
    void getSettings().then((settings) => setupAlarm(settings));
  }
});

/**
 * Safely send overlay trigger to a tab.
 */
async function sendOverlayMessageToTab(tab, options = { force: false }) {
  if (!tab || !tab.id) {
    return { ok: false, reason: 'No tab id available' };
  }

  const tabUrl = tab.url || tab.pendingUrl || '';
  if (!tabUrl) {
    return { ok: false, reason: 'Tab URL not available yet. Please wait for page load and try again.' };
  }

  if (isRestrictedUrl(tabUrl)) {
    return {
      ok: false,
      reason: `Restricted page (${tabUrl.split(':')[0]}://). Open a normal website tab and try again.`
    };
  }

  const now = Date.now();
  const lastSent = lastMessageAtByTabId.get(tab.id) || 0;
  if (!options.force && now - lastSent < MESSAGE_THROTTLE_MS) {
    return { ok: false, reason: 'Skipped duplicate trigger (throttled)' };
  }

  lastMessageAtByTabId.set(tab.id, now);

  console.log('Sending overlay message to tab:', tab.id, tabUrl);

  const delivered = await postMessageToTab(tab.id);
  if (delivered) {
    console.log('Overlay message delivered to tab:', tab.id);
    return { ok: true };
  }

  // If content script is missing (e.g., existing tabs after install), inject and retry once.
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    const retried = await postMessageToTab(tab.id);
    if (retried) {
      console.log('Overlay message delivered after injection:', tab.id);
      return { ok: true };
    }
  } catch (error) {
    // Restricted frames/sites can still fail injection.
    console.log('Injection retry failed:', error?.message || String(error));
  }

  return {
    ok: false,
    reason: 'Could not inject content script into this tab. Refresh the page and try again.'
  };
}

function postMessageToTab(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { action: SHOW_OVERLAY_ACTION }, () => {
      if (chrome.runtime.lastError) {
        console.log('Overlay message skipped:', chrome.runtime.lastError.message);
        resolve(false);
        return;
      }

      resolve(true);
    });
  });
}

function isRestrictedUrl(url) {
  const restrictedPrefixes = [
    'chrome://',
    'chrome-extension://',
    'edge://',
    'about:',
    'view-source:',
    'devtools://'
  ];

  return restrictedPrefixes.some((prefix) => url.startsWith(prefix));
}

async function maybeTriggerForTab(tab) {
  const settings = await getSettings();
  if (!settings.isEnabled) {
    return;
  }

  await sendOverlayMessageToTab(tab);
}

async function getSettings() {
  const result = await chrome.storage.sync.get(['isEnabled', 'interval']);

  return {
    isEnabled: result.isEnabled !== undefined ? result.isEnabled : DEFAULT_SETTINGS.isEnabled,
    interval: Number.isFinite(result.interval) ? result.interval : DEFAULT_SETTINGS.interval
  };
}

async function setupAlarm(settings) {
  await chrome.alarms.clear(ALARM_NAME);

  if (!settings.isEnabled) {
    return;
  }

  const interval = Math.max(1, Number(settings.interval) || DEFAULT_SETTINGS.interval);
  chrome.alarms.create(ALARM_NAME, {
    periodInMinutes: interval
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getSettings') {
    void getSettings().then((settings) => sendResponse(settings));
    return true;
  }

  if (message.action === 'testBreak') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab) {
        sendResponse({ ok: false, reason: 'No active tab' });
        return;
      }

      let result = await sendOverlayMessageToTab(activeTab, { force: true });
      if (result.ok) {
        sendResponse(result);
        return;
      }

      // If current tab is restricted, try another website tab automatically.
      if ((result.reason || '').startsWith('Restricted page')) {
        const fallbackTab = await findFallbackWebsiteTab(activeTab.id);

        if (fallbackTab && fallbackTab.id) {
          try {
            await chrome.tabs.update(fallbackTab.id, { active: true });
          } catch (error) {
            // Ignore activation issues; send message anyway.
          }

          result = await sendOverlayMessageToTab(fallbackTab, { force: true });
          if (result.ok) {
            sendResponse({
              ok: true,
              reason: 'Opened reminder on a normal website tab because current tab is restricted.'
            });
            return;
          }
        }

        // Last fallback: open a normal website tab and trigger there.
        const createdTab = await chrome.tabs.create({ url: 'https://example.com', active: true });
        if (createdTab && createdTab.id) {
          await waitForTabLoadComplete(createdTab.id);
          result = await sendOverlayMessageToTab(createdTab, { force: true });

          if (result.ok) {
            sendResponse({
              ok: true,
              reason: 'Opened a website tab and triggered reminder there (current tab is restricted).'
            });
            return;
          }
        }
      }

      sendResponse(result);
    });

    return true;
  }

  return false;
});

async function findFallbackWebsiteTab(excludedTabId) {
  const tabs = await chrome.tabs.query({ currentWindow: true });

  for (const tab of tabs) {
    if (!tab || !tab.id || tab.id === excludedTabId) {
      continue;
    }

    const tabUrl = tab.url || tab.pendingUrl || '';
    if (!tabUrl || isRestrictedUrl(tabUrl)) {
      continue;
    }

    return tab;
  }

  return null;
}

function waitForTabLoadComplete(tabId, timeoutMs = 12000) {
  return new Promise((resolve) => {
    let done = false;

    const finish = () => {
      if (done) {
        return;
      }

      done = true;
      clearTimeout(timerId);
      chrome.tabs.onUpdated.removeListener(onUpdated);
      resolve();
    };

    const onUpdated = (updatedTabId, changeInfo) => {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        finish();
      }
    };

    const timerId = setTimeout(() => {
      finish();
    }, timeoutMs);

    chrome.tabs.onUpdated.addListener(onUpdated);
  });
}

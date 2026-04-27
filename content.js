/**
 * Content Script
 * Injects a fullscreen 60-second break video overlay into web pages.
 */

(function () {
  if (window.__eyeBreakContentInitialized) {
    return;
  }

  window.__eyeBreakContentInitialized = true;

const OVERLAY_ROOT_ID = 'eye-break-video-overlay-root';
const OVERLAY_STYLE_ID = 'eye-break-video-overlay-style';
const OVERLAY_DURATION_MS = 60000;
const FINISHED_DISPLAY_MS = 2200;

let overlayState = {
  isVisible: false,
  root: null,
  removeTimerId: null,
  countdownTimerId: null,
  startedAt: 0
};

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'showAutoBreakVideo') {
    console.log('Eye Break: received showAutoBreakVideo message');
    showVideoOverlay();
  }
});

function showVideoOverlay() {
  if (overlayState.isVisible) {
    console.log('Eye Break: overlay already visible, skipping');
    return;
  }

  if (!document.documentElement || !document.body) {
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        if (!overlayState.isVisible) {
          showVideoOverlay();
        }
      },
      { once: true }
    );

    return;
  }

  injectOverlayStyles();

  const existingRoot = document.getElementById(OVERLAY_ROOT_ID);
  if (existingRoot) {
    existingRoot.remove();
  }

  const root = document.createElement('div');
  root.id = OVERLAY_ROOT_ID;
  root.innerHTML = `
    <div class="eb-overlay" role="dialog" aria-modal="true" aria-label="Eye break video">
      <div class="eb-backdrop"></div>
      <div class="eb-panel">
        <div class="eb-meta">
          <p class="eb-title">Take a Break</p>
          <p class="eb-countdown" aria-live="polite">60s</p>
        </div>
        <video class="eb-video" autoplay muted loop playsinline preload="auto">
          <source src="${chrome.runtime.getURL('assets/coffee.mp4')}" type="video/mp4" />
        </video>
        <div class="eb-fallback" hidden>
          <p class="eb-fallback-title">Time to rest your eyes</p>
          <p class="eb-fallback-text">Look 20 feet away for 20 seconds</p>
        </div>
        <button class="eb-skip" type="button" aria-label="Skip break video">Skip</button>
      </div>
    </div>
  `;

  document.documentElement.appendChild(root);

  const overlayEl = root.querySelector('.eb-overlay');
  const videoEl = root.querySelector('.eb-video');
  const fallbackEl = root.querySelector('.eb-fallback');
  const skipButton = root.querySelector('.eb-skip');
  const countdownEl = root.querySelector('.eb-countdown');
  const titleEl = root.querySelector('.eb-title');

  videoEl.loop = true;
  videoEl.currentTime = 0;
  videoEl.playbackRate = 1;

  overlayState = {
    isVisible: true,
    root,
    removeTimerId: null,
    startedAt: Date.now()
  };

  // Ensure CSS transitions run.
  requestAnimationFrame(() => {
    overlayEl.classList.add('eb-overlay-visible');
  });

  const closeNow = () => hideVideoOverlay();

  skipButton.addEventListener('click', closeNow, { once: true });

  // If video errors, keep dark break screen for the same 60-second duration.
  videoEl.addEventListener('error', () => {
    console.warn('Eye break video failed to load, keeping overlay visible until timeout');
    videoEl.hidden = true;
    fallbackEl.hidden = false;
  });

  // Autoplay may fail on some pages/policies; keep overlay visible regardless.
  videoEl.play().catch(() => {
    // Intentionally ignored.
  });

  // Extra fallback for browsers that do not honor loop seamlessly.
  videoEl.addEventListener('ended', () => {
    if (!overlayState.isVisible) {
      return;
    }

    videoEl.currentTime = 0;
    videoEl.play().catch(() => {
      // Intentionally ignored.
    });
  });

  overlayState.removeTimerId = window.setTimeout(() => {
    showBreakFinishedState(titleEl, countdownEl, videoEl, fallbackEl);
  }, OVERLAY_DURATION_MS);

  overlayState.countdownTimerId = window.setInterval(() => {
    if (!overlayState.isVisible) {
      return;
    }

    const elapsed = Date.now() - overlayState.startedAt;
    const remainingSeconds = Math.max(0, Math.ceil((OVERLAY_DURATION_MS - elapsed) / 1000));

    if (countdownEl) {
      countdownEl.textContent = remainingSeconds > 0 ? `${remainingSeconds}s` : '0s';
    }

    if (remainingSeconds <= 0) {
      window.clearInterval(overlayState.countdownTimerId);
      overlayState.countdownTimerId = null;
    }
  }, 1000);

  console.log('Eye Break: overlay shown for 60 seconds');
}

function showBreakFinishedState(titleEl, countdownEl, videoEl, fallbackEl) {
  if (!overlayState.isVisible || !overlayState.root) {
    return;
  }

  if (overlayState.countdownTimerId) {
    clearInterval(overlayState.countdownTimerId);
    overlayState.countdownTimerId = null;
  }

  if (videoEl) {
    videoEl.pause();
  }

  if (fallbackEl) {
    fallbackEl.hidden = false;
  }

  if (titleEl) {
    titleEl.textContent = 'Break finished';
  }

  if (countdownEl) {
    countdownEl.textContent = '0s';
  }

  overlayState.removeTimerId = window.setTimeout(() => {
    hideVideoOverlay();
  }, FINISHED_DISPLAY_MS);
}

function hideVideoOverlay() {
  if (!overlayState.isVisible || !overlayState.root) {
    return;
  }

  const root = overlayState.root;
  const overlayEl = root.querySelector('.eb-overlay');
  const videoEl = root.querySelector('.eb-video');

  if (overlayState.removeTimerId) {
    clearTimeout(overlayState.removeTimerId);
  }

  if (overlayState.countdownTimerId) {
    clearInterval(overlayState.countdownTimerId);
  }

  if (videoEl) {
    videoEl.pause();
    videoEl.currentTime = 0;
  }

  overlayEl.classList.remove('eb-overlay-visible');
  overlayEl.classList.add('eb-overlay-hide');

  window.setTimeout(() => {
    if (root.parentElement) {
      root.remove();
    }
  }, 280);

  overlayState = {
    isVisible: false,
    root: null,
    removeTimerId: null,
    countdownTimerId: null,
    startedAt: 0
  };

  console.log('Eye Break: overlay removed');
}

function injectOverlayStyles() {
  if (document.getElementById(OVERLAY_STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = OVERLAY_STYLE_ID;
  style.textContent = `
    #${OVERLAY_ROOT_ID} {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      pointer-events: none;
    }

    #${OVERLAY_ROOT_ID} .eb-overlay {
      position: fixed;
      inset: 0;
      display: grid;
      place-items: center;
      opacity: 0;
      pointer-events: auto;
      transition: opacity 260ms ease;
      will-change: opacity;
    }

    #${OVERLAY_ROOT_ID} .eb-overlay-visible {
      opacity: 1;
    }

    #${OVERLAY_ROOT_ID} .eb-overlay-hide {
      opacity: 0;
    }

    #${OVERLAY_ROOT_ID} .eb-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.88);
    }

    #${OVERLAY_ROOT_ID} .eb-panel {
      position: relative;
      width: min(96vw, 1280px);
      height: min(86vh, 720px);
      display: grid;
      grid-template-rows: auto 1fr;
      place-items: stretch;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
      background: #000;
    }

    #${OVERLAY_ROOT_ID} .eb-meta {
      position: absolute;
      top: 18px;
      left: 18px;
      z-index: 2;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(22, 26, 35, 0.72), rgba(12, 14, 20, 0.55));
      border: 1px solid rgba(255, 255, 255, 0.14);
      backdrop-filter: blur(14px) saturate(135%);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.08);
      color: #fff;
    }

    #${OVERLAY_ROOT_ID} .eb-title {
      font: 700 15px/1.1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      letter-spacing: 0.4px;
      text-transform: uppercase;
      color: #fff8f0;
      opacity: 0.95;
    }

    #${OVERLAY_ROOT_ID} .eb-countdown {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 68px;
      padding: 8px 12px;
      border-radius: 999px;
      font: 800 24px/1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #24160d;
      background: linear-gradient(135deg, #f7e4cf 0%, #d8b08c 100%);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.35);
      animation: timerPulse 1.8s ease-in-out infinite;
      letter-spacing: 0.3px;
    }

    #${OVERLAY_ROOT_ID} .eb-countdown::after {
      content: ' left';
      font-size: 11px;
      font-weight: 700;
      opacity: 0.82;
      margin-left: 4px;
      text-transform: uppercase;
    }

    #${OVERLAY_ROOT_ID} .eb-video {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: #000;
      grid-row: 1 / span 2;
    }

    #${OVERLAY_ROOT_ID} .eb-fallback {
      width: 100%;
      height: 100%;
      display: grid;
      place-content: center;
      text-align: center;
      padding: 28px;
      color: #e7edff;
      background: radial-gradient(circle at center, rgba(48, 69, 120, 0.35), rgba(0, 0, 0, 0.75));
    }

    #${OVERLAY_ROOT_ID} .eb-fallback-title {
      font: 800 30px/1.15 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin-bottom: 10px;
      letter-spacing: -0.4px;
    }

    #${OVERLAY_ROOT_ID} .eb-fallback-text {
      font: 500 16px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      opacity: 0.95;
      max-width: 320px;
      margin: 0 auto;
    }

    #${OVERLAY_ROOT_ID} .eb-meta,
    #${OVERLAY_ROOT_ID} .eb-countdown {
      transform-origin: center;
    }

    #${OVERLAY_ROOT_ID} .eb-overlay-visible .eb-countdown {
      animation: timerPulse 1.8s ease-in-out infinite, timerGlow 3s ease-in-out infinite;
    }

    #${OVERLAY_ROOT_ID} .eb-skip {
      position: absolute;
      top: 14px;
      right: 14px;
      border: 1px solid rgba(255, 255, 255, 0.35);
      background: rgba(0, 0, 0, 0.45);
      color: #fff;
      padding: 8px 12px;
      border-radius: 999px;
      font: 600 13px/1.1 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      cursor: pointer;
      transition: background 140ms ease;
    }

    #${OVERLAY_ROOT_ID} .eb-skip:hover {
      background: rgba(0, 0, 0, 0.65);
    }

    @media (max-width: 720px) {
      #${OVERLAY_ROOT_ID} .eb-panel {
        width: 100vw;
        height: 100vh;
        border-radius: 0;
      }

      #${OVERLAY_ROOT_ID} .eb-meta {
        top: 12px;
        left: 12px;
        right: 12px;
        justify-content: space-between;
      }

      #${OVERLAY_ROOT_ID} .eb-skip {
        top: 10px;
        right: 10px;
      }
    }

    @keyframes timerPulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.04);
      }
    }

    @keyframes timerGlow {
      0%, 100% {
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.35);
      }
      50% {
        box-shadow: 0 8px 22px rgba(0, 0, 0, 0.26), 0 0 0 6px rgba(216, 176, 140, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.35);
      }
    }
  `;

  document.documentElement.appendChild(style);
}

})();

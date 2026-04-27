# Eye Break Helper - Technical Documentation

## Architecture Overview

This extension follows the Manifest V3 architecture with three main components:

```
┌─────────────────────────────────────┐
│      User Settings Interface        │
│    (popup.html + popup.js)          │
│  - Enable/Disable toggle            │
│  - Interval configuration           │
│  - Test reminder button             │
└──────────────┬──────────────────────┘
               │ Stores settings
               ↓
┌─────────────────────────────────────┐
│      Chrome Storage (Sync)          │
│  - isEnabled (boolean)              │
│  - interval (number: minutes)       │
└──────────────┬──────────────────────┘
               │ Reads settings
               ↓
┌─────────────────────────────────────┐
│    Background Service Worker        │
│       (background.js)               │
│  - Manages Chrome Alarms API        │
│  - Sends messages to content scripts│
│  - Listens for storage changes      │
└──────────────┬──────────────────────┘
               │ Sends messages
               ↓
┌─────────────────────────────────────┐
│      Content Script Layer           │
│       (content.js)                  │
│  - Injected on all websites         │
│  - Displays overlay with animation  │
│  - Handles user interactions        │
└─────────────────────────────────────┘
```

## Chrome APIs Used

### 1. Chrome Storage API
```javascript
// Save settings
chrome.storage.sync.set({ isEnabled: true, interval: 5 });

// Read settings
chrome.storage.sync.get(['isEnabled', 'interval'], (result) => {
  console.log(result.isEnabled, result.interval);
});

// Listen for changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync') {
    // React to changes
  }
});
```

### 2. Chrome Alarms API
```javascript
// Create a repeating alarm
chrome.alarms.create('eyeBreakReminder', {
  periodInMinutes: 5
});

// Listen for alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'eyeBreakReminder') {
    // Trigger action
  }
});

// Clear alarms
chrome.alarms.clearAll();
```

### 3. Chrome Tabs API
```javascript
// Query all tabs
chrome.tabs.query({}, (tabs) => {
  tabs.forEach((tab) => {
    // Send message to tab
  });
});

// Send message to specific tab
chrome.tabs.sendMessage(tabId, { action: 'showBreakReminder' });
```

### 4. Chrome Runtime API
```javascript
// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getSettings') {
    sendResponse({ /* data */ });
  }
});

// Send message
chrome.runtime.sendMessage({ action: 'testBreak' });

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  // Setup
});
```

## Manifest V3 Key Differences

### From Manifest V2 → V3

| Feature | V2 | V3 |
|---------|----|----|
| Background | `background.html` + script | Service worker only |
| Content scripts | `content_scripts` | Same structure |
| Storage | `chrome.storage` (same) | `chrome.storage` (same) |
| Timing | `setInterval()` | Chrome Alarms API |
| Permissions | `permissions` | `permissions` + `host_permissions` |

### Why Service Worker?
- Loads only when needed (energy efficient)
- No persistent background page (resource efficient)
- Must be stateless and responsive
- Automatically suspends when idle

## Message Passing Flow

### Background Worker → Content Script
```javascript
// background.js
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'eyeBreakReminder') {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'showBreakReminder'
        });
      });
    });
  }
});

// content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showBreakReminder') {
    showBreakReminder();
  }
});
```

## Content Script Injection

The content script is injected on all URLs except restricted ones:

```json
{
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_start"
    }
  ]
}
```

### Why `run_at: document_start`?
- Injects before page content loads
- Ensures script is available immediately
- No "flickering" of overlay

### Restricted URLs
The script filters out:
- `chrome://` - Chrome internal pages
- `edge://` - Edge internal pages
- `about:` - About pages
- `file://` - Local files

## CSS Animation System

### Keyframe Animations (GPU Accelerated)

```css
@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes steamFloat {
  0% { transform: translateY(0) scaleY(1); opacity: 0.5; }
  100% { transform: translateY(-50px) scaleY(0.8); opacity: 0; }
}
```

### CSS Grid System for Overlay
```css
.eye-break-content {
  display: flex;
  align-items: center;
  gap: 30px;
}

/* Message section */
.eye-break-message {
  flex: 1;
}

/* Video/Animation section */
.eye-break-video-container {
  flex: 1;
  width: 200px;
  height: 150px;
}
```

## Storage Schema

```javascript
// Stored in chrome.storage.sync
{
  isEnabled: true,      // Boolean - Feature enabled/disabled
  interval: 5           // Number - Minutes between reminders
}
```

### Why `sync` instead of `local`?
- `sync`: Syncs across user's Chrome instances
- `local`: Only on this device
- Use `sync` for user preferences

## Error Handling

### Content Script Errors
```javascript
// Silently ignore tabs where content script isn't loaded
chrome.tabs.sendMessage(tab.id, message).catch(() => {
  // Ignore error - tab may not have script loaded
});
```

### Video Fallback
```javascript
video.addEventListener('error', () => {
  video.style.display = 'none';
  videoContainer.querySelector('.eye-break-animation-fallback')
    .style.display = 'block';
});
```

### Audio Autoplay
```javascript
audio.play().catch(() => {
  console.log('Audio autoplay blocked by browser');
  // Silent fail - video still shows
});
```

## Performance Considerations

### Z-Index Management
```javascript
// Maximum z-index to appear above all content
z-index: 2147483647; // 2^31 - 1
```

### Event Delegation
```javascript
// Don't add listeners to every element
// Use single listener on container
container.addEventListener('click', (e) => {
  if (e.target.classList.contains('close')) {
    // Handle close
  }
});
```

### Memory Cleanup
```javascript
function closeReminder(container, audio) {
  audio.pause();
  audio.currentTime = 0;
  
  setTimeout(() => {
    if (container.parentElement) {
      container.remove();  // Remove from DOM
    }
  }, 300);
}
```

## Advanced Customization

### Adding Custom Video
1. Convert video to MP4 format (supports H.264)
2. Place in `assets/` folder
3. Get your extension ID from `chrome://extensions/`
4. Update video source:

```javascript
const videoUrl = `chrome-extension://${chrome.runtime.id}/assets/my-video.mp4`;
```

### Adding Local Audio
```javascript
// In content.js
audio.src = chrome.runtime.getURL('assets/relax-sound.mp3');
```

### Custom Timings
```javascript
// Change in background.js
chrome.alarms.create('eyeBreakReminder', {
  periodInMinutes: customInterval,
  delayInMinutes: 1  // Wait 1 min before first reminder
});
```

### Restricting to Specific Domains
```json
{
  "content_scripts": [
    {
      "matches": ["https://github.com/*", "https://stackoverflow.com/*"],
      "js": ["content.js"]
    }
  ]
}
```

## Browser DevTools Debugging

### Service Worker Console
1. Go to `chrome://extensions/`
2. Click "Details" on your extension
3. Click "Inspect views" → "service worker"
4. View console logs from background.js

### Content Script Console
1. Open any webpage (where content script is active)
2. Press F12 to open DevTools
3. Go to Console tab
4. See logs from content.js

### Storage Inspector
1. Go to `chrome://extensions/`
2. Click "Details" on your extension
3. Click "Inspect views" → "service worker"
4. Go to Application tab → Storage → sync

### Performance Metrics
1. Open DevTools (F12)
2. Go to Performance tab
3. Record while overlay displays
4. Check for smooth 60 FPS animations

## Testing Checklist

- [ ] Alarm triggers at correct interval
- [ ] Message sends to all active tabs
- [ ] Content script displays overlay
- [ ] Animation plays smoothly (no jank)
- [ ] Video loads and plays
- [ ] Audio plays (if not blocked)
- [ ] Close button removes overlay
- [ ] Auto-close after 15 seconds works
- [ ] Settings persist after reload
- [ ] Toggle enables/disables reminders
- [ ] No page reload occurs
- [ ] Works on different websites
- [ ] Works on multiple tabs simultaneously

## Release Checklist

- [ ] All console errors resolved
- [ ] Code commented thoroughly
- [ ] Manifest version bumped
- [ ] Icons created (16x16, 48x48, 128x128)
- [ ] README updated
- [ ] Tested in incognito mode
- [ ] Tested with sync disabled
- [ ] Performance verified (DevTools)
- [ ] Works across multiple Chrome instances

---

**For questions:** Refer to [Chrome Extension Developer Docs](https://developer.chrome.com/docs/extensions/)

# Eye Break Helper - Customization Guide

This guide shows how to customize the extension to match your preferences and branding.

## 🎨 UI Customization

### 1. Change Colors

**Edit in `styles.css`:**

Current gradient (purple):
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

Popular alternatives:

**Ocean Blue:**
```css
background: linear-gradient(135deg, #1e90ff 0%, #00bfff 100%);
```

**Green (Relaxing):**
```css
background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
```

**Warm Orange:**
```css
background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
```

**Sunset:**
```css
background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
```

**Dark Mode:**
```css
background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
```

### 2. Change the Message Text

**Edit in `content.js` (around line 50):**

Current:
```javascript
<h2>Take a Break!</h2>
<p>Let's rest your eyes for a moment</p>
```

Examples:
```javascript
// For productivity focus
<h2>Focus Reset ⏱️</h2>
<p>Blink 3 times and look away</p>

// For wellness
<h2>Wellness Check 🧘</h2>
<p>Breathe deeply and relax your eyes</p>

// For fun
<h2>Time for ☕!</h2>
<p>Grab a cup and stretch</p>

// For health tips
<h2>Eye Care Time!</h2>
<p>Follow the 20-20-20 rule: Look 20ft away for 20 seconds</p>
```

### 3. Change the Emoji

**Edit in `content.js` and `popup.html`:**

Content script (line ~45):
```javascript
<span class="eye-break-emoji">👀</span>
```

Popup (line ~11):
```html
<span class="popup-emoji">👀</span>
```

Other emoji ideas:
- `💆` - Relaxation
- `🌟` - Mindfulness
- `✨` - Wellness
- `🧠` - Focus
- `💪` - Energy
- `🎯` - Target
- `⏸️` - Pause
- `🌈` - Positivity

### 4. Change Animation Speed

**Edit in `content.js` (around line 70):**

Current (0.5 seconds):
```javascript
transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
```

Faster (0.3s):
```javascript
transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
```

Slower (1s):
```javascript
transition: transform 1s cubic-bezier(0.34, 1.56, 0.64, 1);
```

### 5. Change Overlay Height

**Edit in `styles.css`:**

Current:
```css
.eye-break-content {
  min-height: 150px;
  padding: 30px 40px;
}
```

Make taller:
```css
min-height: 200px;
padding: 40px 50px;
```

Make shorter:
```css
min-height: 120px;
padding: 20px 30px;
```

## 📝 Content Customization

### Change Default Reminder Interval

**Edit in `popup.html` (around line 55):**

```html
<input 
    type="range" 
    id="intervalSlider" 
    min="1" 
    max="60" 
    value="5"  <!-- Change this -->
    class="interval-slider"
>
```

Change `value="5"` to your preference (1-60 minutes).

### Change Default in Background Worker

**Edit in `background.js` (around line 10):**

```javascript
chrome.storage.sync.set({
  isEnabled: true,
  interval: 5  // Change this to your default
});
```

### Customize Preset Buttons

**Edit in `popup.html` (around line 70):**

```html
<div class="interval-presets">
    <button class="preset-btn" data-value="5">5 min</button>
    <button class="preset-btn" data-value="15">15 min</button>
    <button class="preset-btn" data-value="30">30 min</button>
</div>
```

Change to your preferences:
```html
<button class="preset-btn" data-value="10">10 min</button>
<button class="preset-btn" data-value="20">20 min</button>
<button class="preset-btn" data-value="45">45 min</button>
```

## 🎬 Media Customization

### Use Your Own Video

1. **Prepare video:**
   - Format: MP4 (H.264 codec)
   - Duration: 10-15 seconds recommended
   - Resolution: 1280x720 or smaller
   - Size: Keep under 5MB

2. **Add to extension:**
   - Place in `assets/my-video.mp4`

3. **Update `content.js` (around line 50):**

```javascript
<!-- Instead of Tenor URL, use: -->
<source src="chrome-extension://__MSG_@@extension_id__/assets/my-video.mp4" type="video/mp4">
```

Or get extension ID dynamically:
```javascript
const extensionId = chrome.runtime.id;
const videoSrc = `chrome-extension://${extensionId}/assets/my-video.mp4`;
```

### Use Your Own Audio

1. **Prepare audio:**
   - Format: MP3 or WAV
   - Duration: 5-10 seconds recommended
   - Volume: Not too loud (background sound)
   - Size: Keep under 1MB

2. **Add to extension:**
   - Place in `assets/relax-sound.mp3`

3. **Update `content.js` (around line 55):**

```javascript
<audio class="eye-break-audio" preload="auto">
    <source src="chrome-extension://__MSG_@@extension_id__/assets/relax-sound.mp3" type="audio/mpeg">
</audio>
```

### Remove Video or Audio

**To remove video:**
```javascript
<!-- Comment out video section -->
<!-- <div class="eye-break-video-container">
    <video class="eye-break-video" autoplay muted playsinline>
        ...
    </video>
</div> -->
```

**To remove audio:**
```javascript
<!-- Comment out audio -->
<!-- <audio class="eye-break-audio" preload="auto">
    ...
</audio> -->
```

## 🎯 Behavior Customization

### Change Auto-Close Time

**Edit in `content.js` (around line 115):**

Current (15 seconds):
```javascript
setTimeout(() => {
    if (isBreakVisible && container.parentElement) {
      closeReminder(container, audio);
    }
}, 15000);  // 15000 ms = 15 seconds
```

Change to 30 seconds:
```javascript
}, 30000);  // 30000 ms = 30 seconds
```

Change to 10 seconds:
```javascript
}, 10000);  // 10000 ms = 10 seconds
```

### Disable Auto-Close

Delete or comment out that setTimeout block.

### Make Overlay Full Screen

**Edit in `content.js` - change overlay height:**

```css
.eye-break-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100vh;  /* Full viewport height */
  /* ... rest of styles ... */
}
```

### Remove Close Button

**Edit in `content.js` (around line 45):**

```javascript
<!-- Remove this line: -->
<button class="eye-break-close" title="Close reminder">×</button>
```

Users can only close by waiting for timeout.

## 🔊 Sound Customization

### Disable Sound by Default

**Edit in `content.js` (around line 85):**

```javascript
// Current:
audio.play().catch(() => {
  console.log('Audio autoplay blocked by browser');
});

// Change to:
// Don't play audio automatically (optional: add user toggle later)
// audio.play();
```

### Add Volume Control

**Add this to `content.js`:**

```javascript
// Add volume slider
const volumeControl = document.createElement('input');
volumeControl.type = 'range';
volumeControl.min = '0';
volumeControl.max = '100';
volumeControl.value = '50';
volumeControl.addEventListener('input', (e) => {
  audio.volume = e.target.value / 100;
});
```

## 🎨 Coffee Cup Animation Customization

### Change Cup Color

**Edit in `styles.css` (around line 195):**

```css
.cup-body {
  background: linear-gradient(90deg, #D2B48C 0%, #E8D4B8 50%, #D2B48C 100%);
  /* D2B48C = tan color */
  /* Change to: */
  background: linear-gradient(90deg, #8B4513 0%, #A0522D 50%, #8B4513 100%); /* Brown */
  /* Or: */
  background: linear-gradient(90deg, #FF69B4 0%, #FF1493 50%, #FF69B4 100%); /* Pink */
  /* Or: */
  background: linear-gradient(90deg, #4169E1 0%, #1E90FF 50%, #4169E1 100%); /* Blue */
}
```

### Change Steam Color

**Edit in `styles.css` (around line 220):**

```css
.steam {
  background: rgba(255, 255, 255, 0.6);  /* White steam */
  /* Change to: */
  background: rgba(200, 200, 255, 0.6);  /* Blue steam */
  background: rgba(255, 200, 100, 0.6);  /* Orange steam */
}
```

### Change Animation Speed

**Edit in `styles.css` (around line 225):**

```css
.steam {
  animation: steamFloat 2s ease-in-out infinite;  /* 2 seconds */
  /* Change to: */
  animation: steamFloat 1s ease-in-out infinite;  /* Faster */
  animation: steamFloat 4s ease-in-out infinite;  /* Slower */
}
```

## 🌍 Multi-Language Support

### Change UI Language

Create new popup translation file `popup-es.html`:

```html
<h1>Asistente de Descanso Visual</h1>
<span class="label-title">Activar recordatorios</span>
```

Add language detection:

```javascript
const lang = navigator.language.split('-')[0];
if (lang === 'es') {
  // Load Spanish version
}
```

## 🔐 Advanced: Add Settings Persistence

**Store custom settings in `popup.js`:**

```javascript
// Save theme preference
chrome.storage.sync.set({
  theme: 'purple',
  messageDuration: 15,
  videoUrl: 'custom-path.mp4'
});

// Load theme on startup
chrome.storage.sync.get(['theme'], (result) => {
  if (result.theme === 'dark') {
    applyDarkTheme();
  }
});
```

## 📊 Common Customization Recipes

### Recipe 1: Minimal Design
- Remove video
- Remove audio
- Keep only message + close button
- Reduce animation duration

### Recipe 2: Focus Mode
- Red/Orange colors
- Shorter duration (10 seconds)
- "FOCUS TIME" message
- Louder audio alert

### Recipe 3: Wellness Mode
- Green/Blue colors
- Longer duration (20 seconds)
- Zen message
- Calming music
- Full-screen overlay

### Recipe 4: Productivity Mode
- Blue colors
- Quick notification (5 seconds)
- Show timer countdown
- Optional: Open notes app on click

## ⚠️ Customization Tips

✅ **DO:**
- Test changes in multiple browsers/tabs
- Back up original files before modifying
- Test with slow internet (video might not load)
- Use consistent colors and fonts
- Keep message text concise

❌ **DON'T:**
- Add too much content (keep it simple)
- Use distracting animations
- Make overlay too large
- Add heavy video files (>10MB)
- Break the manifest.json structure

---

**Need help?** Check TECHNICAL_DOCS.md for API references.

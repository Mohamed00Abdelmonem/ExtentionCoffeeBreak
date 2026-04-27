# Eye Break Helper - Chrome Extension (Manifest V3)

A gentle and elegant Chrome extension that reminds you to take eye breaks while working. The extension displays a smooth, animated overlay with a relaxing video and sound every 5 minutes (customizable).

## 📋 Features

✨ **Key Features:**
- ⏰ Automatic eye break reminders every 5 minutes (configurable)
- 🎬 Smooth CSS animations and optional video playback
- 🎵 Relaxing background sound effect
- ☁️ Floating coffee cup CSS animation fallback
- 🎨 Beautiful, non-intrusive UI
- 💾 Settings saved to Chrome storage
- 🔌 Works on any website without page reload
- ⚙️ Easy enable/disable toggle
- 🧪 Test reminder button for immediate preview
- 📱 Responsive design

## 🏗️ Project Structure

```
eye-break-extension/
├── manifest.json           # Extension configuration (Manifest V3)
├── background.js           # Service worker - handles alarms & timing
├── content.js              # Content script - displays animations on pages
├── popup.html              # Settings popup UI
├── popup.js                # Settings popup logic
├── styles.css              # All styling (popup + content script overlay)
├── icons/                  # Extension icons
│   ├── icon-16.png         # Small icon
│   ├── icon-48.png         # Medium icon
│   └── icon-128.png        # Large icon
└── assets/                 # Optional - for local videos/sounds
    └── (video and audio files)
```

## 🛠️ Installation & Setup

### Step 1: Prepare Icons (Optional)
Create simple 16x16, 48x48, and 128x128 PNG icons for the extension or use placeholder images.

**Quick way (using online tools):**
1. Go to an online image editor or use Windows Paint
2. Create 16x16, 48x48, and 128x128 images with a simple design
3. Save as PNG in the `icons/` folder

Or use these placeholder commands in PowerShell:
```powershell
# You can create placeholder icons with any image editing tool
# For now, they can be simple solid-colored PNGs
```

### Step 2: Load Extension in Chrome

1. **Open Chrome Extensions Page:**
   - Go to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top right corner)

2. **Load Unpacked Extension:**
   - Click **"Load unpacked"**
   - Navigate to and select the `eye-break-extension/` folder
   - The extension will appear in your extensions list

3. **Verify Installation:**
   - You should see the "Eye Break Helper" extension in your extensions list
   - A purple icon will appear in the Chrome toolbar
   - Right-click the icon and select "Pin" to keep it visible

## 📖 Usage

### First Time Setup
1. Click the extension icon in your toolbar
2. The popup will open showing settings
3. Verify that "Enable Reminders" is toggled ON
4. Default interval is 5 minutes - adjust if needed
5. Close the popup

### During Work
- Every 5 minutes (or your custom interval), a beautiful overlay will drop down from the top
- Shows a "Take a Break!" message with emoji
- Plays a relaxing coffee cup animation or video
- Optional: Sound plays automatically
- **Close the reminder** by:
  - Clicking the "×" button
  - Waiting for the video to finish (auto-closes)
  - Waiting 15 seconds (auto-closes)

### Testing
- Click the extension icon → Click "Test Reminder" button
- The reminder will appear immediately
- Useful for testing before you use it!

### Settings
- **Enable/Disable:** Toggle reminders on/off without removing the extension
- **Interval:** Change reminder frequency (1-60 minutes)
- **Presets:** Quick buttons for 5, 15, or 30 minute intervals
- Settings are saved automatically to Chrome storage

## 🎨 Customization

### Change Reminder Interval
Edit in `popup.html` - line with `min="1" max="60"`:
```html
<input type="range" id="intervalSlider" min="1" max="60" value="5">
```

### Customize the Message
Edit in `content.js` - search for "Take a Break":
```javascript
<p>Let's rest your eyes for a moment</p>
```

### Change Animation Duration
Edit in `content.js` - look for timeout values:
```javascript
// Auto-close after 15 seconds
setTimeout(() => {
  closeReminder(container, audio);
}, 15000); // Change 15000 (15 seconds) to desired milliseconds
```

### Use Local Video Files
1. Add video file to `assets/` folder
2. Update `content.js` - change video source URL:
```javascript
<source src="https://media.tenor.com/..." type="video/mp4">
```
To:
```javascript
<source src="chrome-extension://YOUR_EXTENSION_ID/assets/your-video.mp4" type="video/mp4">
```

### Use Local Audio Files
1. Add audio file to `assets/` folder
2. Update `content.js` - change audio source URL
3. Get your extension ID from `chrome://extensions/`

### Customize Colors
Edit in `content.js` and `styles.css`:
- Main gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Change hex colors to your preference

## 🔧 Technical Details

### Manifest V3 Key Components

**1. Background Service Worker** (`background.js`)
- Creates and manages periodic alarms using Chrome Alarms API
- Listens for alarm triggers
- Sends messages to content scripts when it's time for a break
- Manages user settings with Chrome Storage API

**2. Content Script** (`content.js`)
- Injected on all webpages (except restricted URLs)
- Receives messages from background worker
- Dynamically injects overlay HTML + CSS
- Handles animations, video playback, and user interactions
- Doesn't reload the page

**3. Popup** (`popup.html` + `popup.js`)
- Settings interface for enable/disable toggle
- Interval slider and presets
- Test button for immediate preview
- Status messages for user feedback

### How It Works
```
User sets interval (5 min) in popup
           ↓
Chrome stores settings in chrome.storage.sync
           ↓
Background worker creates alarm for 5 minutes
           ↓
Alarm triggers → Background worker sends message to all tabs
           ↓
Content script receives message → Shows overlay
           ↓
User closes overlay OR video ends OR 15 sec timeout
           ↓
Overlay removed, page continues normally
```

## 🐛 Troubleshooting

### Reminder doesn't appear
1. Check if extension is **enabled** in settings
2. Verify toggle is ON in popup
3. Make sure it's been 5+ minutes since last reminder
4. Use "Test Reminder" button to verify it works

### Sound doesn't play
- Browser may block autoplay of audio
- This is normal for security reasons
- Video plays without sound as fallback
- Can be fixed by user granting audio permission

### Video doesn't load
- Tenor.com video URL might be blocked or changed
- CSS animation fallback displays instead
- Animation shows automatically and looks smooth
- Extension still works correctly

### Extension icon not visible
- Open `chrome://extensions/`
- Find "Eye Break Helper"
- Click menu (three dots) → "Pin to toolbar"

### Settings don't save
- Check if Chrome sync is enabled
- Go to `chrome://sync/` to verify
- Try using incognito window (sync may be disabled)

## 📦 Distribution

### To Share Your Extension

**Option 1: Local Installation (Testing)**
- User downloads the folder
- Goes to `chrome://extensions/`
- Enables Developer mode
- Clicks "Load unpacked" and selects folder

**Option 2: Chrome Web Store (Distribution)**
1. Go to [Chrome Web Store Developer Console](https://chrome.google.com/webstore/developer/dashboard)
2. Create developer account ($5 one-time fee)
3. Click "New Item"
4. Upload your extension folder
5. Fill in details, screenshots, description
6. Submit for review (typically 1-3 hours)
7. Once approved, users can install via Web Store

### Before Distribution
- Update manifest.json with your details
- Create proper 1280x800 screenshot
- Write compelling description
- Create 440x280, 920x680 promotional images
- Test thoroughly on different websites

## 🎯 Best Practices for Eye Health

The **20-20-20 Rule:**
- Every 20 minutes
- Look at something 20 feet away
- For 20 seconds

**Additional Tips:**
- Adjust monitor brightness to match surroundings
- Position monitor 20-26 inches from eyes
- Keep eyes level with top of screen
- Blink frequently to keep eyes moist
- Follow this extension's reminders! 👀

## 📝 Code Comments

All files include detailed comments explaining:
- Function purposes
- Parameter descriptions
- Complex logic sections
- Browser API usage
- Event handling flows

## 🚀 Performance Considerations

- ✅ Minimal CPU usage (alarm-based, not polling)
- ✅ Low memory footprint (single content script per page)
- ✅ No page reload or slowdown
- ✅ Efficient CSS animations (GPU accelerated)
- ✅ Audio is small and cached
- ✅ Only active when enabled

## 📄 License

This extension is provided as-is for personal and educational use.

## ❓ FAQ

**Q: Will this slow down my browser?**
A: No, the extension uses the efficient Chrome Alarms API and only injects overlay when needed.

**Q: Does it work on all websites?**
A: Yes, except for Chrome's internal pages (chrome://, about:, etc.)

**Q: Can I change the animation?**
A: Absolutely! Edit `content.js` to customize colors, messages, duration, and styles.

**Q: Does it track my activity?**
A: No, this extension only runs locally and doesn't collect any data.

**Q: Can I use my own video?**
A: Yes, add your MP4 to the `assets/` folder and update the video source in `content.js`.

**Q: What if I disable it?**
A: Reminders stop appearing, but the extension stays installed. Toggle it back on anytime.

---

**Made with ❤️ for your eyes** 👀

Enjoy better eye health while working!

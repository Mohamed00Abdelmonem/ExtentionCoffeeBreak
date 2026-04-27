# Eye Break Helper - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Create Icons (Quick Fix)
For now, you can use simple placeholder images. Create three PNG files:
- `icons/icon-16.png` (16x16 pixels)
- `icons/icon-48.png` (48x48 pixels)  
- `icons/icon-128.png` (128x128 pixels)

**Quickest method:** Use any simple image and resize it to these dimensions using an online tool or Paint.

### 2. Load in Chrome

1. Type `chrome://extensions` in Chrome
2. Enable **"Developer mode"** (top right toggle)
3. Click **"Load unpacked"**
4. Select the `eye-break-extension` folder
5. Done! ✅

### 3. Test It

1. Click the extension icon in toolbar
2. Click **"Test Reminder"** button
3. You should see a beautiful overlay drop down from the top
4. Close it by clicking the **"×"** button

### 4. Configure

- **Enable/Disable:** Use the toggle in popup
- **Change Interval:** Use slider or preset buttons (5/15/30 min)
- Settings auto-save!

## 📂 File Overview

| File | Purpose |
|------|---------|
| `manifest.json` | Extension configuration - tells Chrome what this is |
| `background.js` | Timing engine - triggers reminders every X minutes |
| `content.js` | Display engine - shows the overlay on websites |
| `popup.html/js` | Settings interface - what user sees when clicking icon |
| `styles.css` | All styling - both popup and overlay animations |

## 🎯 What Gets Triggered

```
⏰ Every 5 minutes (configurable)
  ↓
📨 Background worker sends message to page
  ↓
🎨 Content script shows animated overlay
  ↓
👁️ User sees "Take a Break!" with animation
  ↓
× User clicks close (or video ends, or 15 sec passes)
  ↓
✨ Overlay disappears smoothly
```

## ⚙️ Common Customizations

### Change the interval
Edit `popup.html` line ~55:
```html
<input type="range" id="intervalSlider" min="1" max="60" value="5">
```
Change `value="5"` to different number

### Change the message
Edit `content.js` around line 50:
```javascript
<h2>Take a Break!</h2>
<p>Let's rest your eyes for a moment</p>
```

### Change colors
Edit color in `styles.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

## 🔍 Testing Checklist

- [ ] Icon appears in toolbar
- [ ] Popup opens when clicking icon
- [ ] Toggle switches on/off
- [ ] Slider changes values 1-60
- [ ] Preset buttons (5/15/30) work
- [ ] "Test Reminder" shows overlay
- [ ] Overlay appears from top with animation
- [ ] Close button (×) works
- [ ] Overlay auto-closes after 15 seconds
- [ ] No page reload happens

## 📱 Browser Support

✅ Chrome 88+
✅ Edge 88+ (same engine as Chrome)
❌ Firefox (needs different manifest format)
❌ Safari (different extension system)

## 🐛 Quick Fixes

**Can't load extension?**
- Check if it's a folder (not a .zip file)
- Make sure all files are in that folder
- Make sure manifest.json is there

**Icon doesn't show?**
- Reload extension (click reload icon)
- Or unload and load again

**Reminder doesn't trigger?**
- Wait 5 minutes (or configured interval)
- Use "Test Reminder" button
- Check if toggle is ON

**Settings won't save?**
- Check if Chrome sync is enabled
- Try opening popup again

## 🎨 Visual Customization

### Colors (in styles.css)
- Primary: `#667eea` (purple)
- Secondary: `#764ba2` (dark purple)
- Change to your brand colors!

### Animation Speed
- Slide down: `0.5s` in content.js
- Change to `0.3s` for faster, `1s` for slower

### Overlay Position
Default: Drops from top
To change: Edit `transform: translateY(-100%)` in styles.css

## 📞 Need Help?

If something doesn't work:
1. Open Developer Tools: Press `F12`
2. Go to **Console** tab
3. Look for error messages
4. Check **Network** tab to see if files loaded

## 🚀 Next Steps

1. ✅ Get it working locally
2. 📝 Customize messages and colors
3. 🎬 Add your own video file
4. 🎵 Add your own sound
5. 🔄 Test on different websites
6. 📦 Distribute to friends or publish to Chrome Web Store

---

**Happy healthy eyes! 👀**

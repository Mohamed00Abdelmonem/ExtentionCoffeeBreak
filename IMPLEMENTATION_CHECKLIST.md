# Eye Break Helper - Implementation Checklist

Follow this checklist to ensure your extension is properly set up and working.

## ✅ Pre-Installation Checklist

- [ ] All files are in the `eye-break-extension/` folder
- [ ] `manifest.json` exists in root folder
- [ ] `background.js` exists in root folder
- [ ] `content.js` exists in root folder
- [ ] `popup.html` exists in root folder
- [ ] `popup.js` exists in root folder
- [ ] `styles.css` exists in root folder
- [ ] `icons/` folder exists (can contain placeholder images)
- [ ] No `.zip` file - must be unzipped folder

## 📦 File Structure Verification

Run this command in PowerShell to verify structure:

```powershell
Get-ChildItem -Path "path\to\eye-break-extension" -Recurse | Format-Table -AutoSize
```

Expected output includes:
```
manifest.json
background.js
content.js
popup.html
popup.js
styles.css
README.md
icons/
assets/
```

## 🔧 Installation Steps

### Step 1: Open Chrome Extensions
- [ ] Open Chrome browser
- [ ] Type `chrome://extensions` in address bar
- [ ] Press Enter

### Step 2: Enable Developer Mode
- [ ] Look for "Developer mode" toggle in top right
- [ ] Click the toggle to turn ON (should be blue)

### Step 3: Load Extension
- [ ] Click "Load unpacked" button
- [ ] Navigate to `eye-break-extension` folder
- [ ] Click "Select Folder" or "Open"
- [ ] Wait for extension to load

### Step 4: Verify Installation
- [ ] Extension appears in list with name "Eye Break Helper"
- [ ] Extension shows ID (e.g., `kjhgfdsfkhjgfdkj`)
- [ ] No error messages shown
- [ ] Purple icon appears in toolbar

## 🧪 Functionality Testing

### Test 1: Popup Opens
- [ ] Click extension icon in toolbar
- [ ] Popup window opens
- [ ] Settings interface is visible
- [ ] No errors in console

### Test 2: Enable/Disable Toggle
- [ ] In popup, toggle "Enable Reminders" ON
- [ ] Toggle turns blue/active
- [ ] Setting persists after closing popup
- [ ] Toggle "Enable Reminders" OFF
- [ ] Toggle turns gray/inactive

### Test 3: Interval Slider
- [ ] In popup, move interval slider
- [ ] Number updates (shows 1-60)
- [ ] Preset buttons update styling
- [ ] Click preset buttons (5/15/30 min)
- [ ] Slider updates to match

### Test 4: Test Reminder Button
- [ ] Click "Test Reminder" button
- [ ] Button shows "Testing..." animation
- [ ] After ~1 second, overlay appears
- [ ] Overlay drops down from top smoothly
- [ ] Shows "Take a Break!" message with emoji
- [ ] Shows coffee cup animation
- [ ] Close button (×) is visible

### Test 5: Close Overlay
- [ ] With overlay visible, click × button
- [ ] Overlay slides up and disappears
- [ ] Page content reappears
- [ ] No page reload

### Test 6: Auto-Close Timer
- [ ] Trigger test reminder again
- [ ] Wait 15 seconds without clicking close
- [ ] Overlay automatically closes
- [ ] Page continues working normally

### Test 7: Works on Multiple Websites
- [ ] Visit Google (google.com)
- [ ] Click extension → Test Reminder
- [ ] Verify overlay appears
- [ ] Visit Twitter/X (twitter.com)
- [ ] Click extension → Test Reminder
- [ ] Verify overlay appears on Twitter too

### Test 8: Settings Persistence
- [ ] Set interval to 20 minutes
- [ ] Close popup
- [ ] Close and reopen extension popup
- [ ] Verify interval still shows 20 minutes
- [ ] Refresh page
- [ ] Open popup again
- [ ] Interval still 20 minutes

### Test 9: Console Check
- [ ] Open DevTools (F12)
- [ ] Go to Console tab
- [ ] Trigger test reminder
- [ ] Look for log message: "Showing break reminder..."
- [ ] No error messages (red text)

### Test 10: Background Worker
- [ ] Go to `chrome://extensions/`
- [ ] Find your extension
- [ ] Click "Details"
- [ ] Click "Inspect views" → "service worker"
- [ ] New window opens with service worker console
- [ ] No error messages shown

## ⚙️ Advanced Verification

### Check Storage
- [ ] Open service worker (from test #10)
- [ ] Go to Application tab
- [ ] Click Storage → sync → chrome-extension://[ID]
- [ ] Verify data shows:
  - `isEnabled: true` or `false`
  - `interval: 5` (or your set value)

### Check Alarms
- [ ] In service worker console, type:
  ```javascript
  chrome.alarms.getAll((alarms) => { console.log(alarms); });
  ```
- [ ] Press Enter
- [ ] Should show alarm named "eyeBreakReminder"
- [ ] Alarm should have `periodInMinutes: 5` (or your interval)

### Check Permissions
- [ ] In service worker console, type:
  ```javascript
  chrome.runtime.getManifest().permissions;
  ```
- [ ] Should show: `["storage", "alarms"]`

## 🚨 Troubleshooting Checklist

### Problem: Extension doesn't load
- [ ] Verify manifest.json is valid JSON (no syntax errors)
- [ ] Check that folder path is correct
- [ ] Verify all required files exist
- [ ] Try unloading and reloading extension
- [ ] Check console for error messages

### Problem: Icon doesn't appear
- [ ] Close and reopen Chrome
- [ ] Reload extension (click reload icon)
- [ ] Check if extension is disabled (toggle in list)
- [ ] Try right-clicking extension → Pin to toolbar

### Problem: Overlay doesn't appear
- [ ] Make sure toggle is ON in popup
- [ ] Click "Test Reminder" button
- [ ] Check if content script loaded (F12 console shows logs)
- [ ] Try on a different website
- [ ] Check if page is a restricted URL (chrome://, about:, etc.)

### Problem: Settings don't save
- [ ] Check if Chrome Sync is enabled
- [ ] Open Developer Tools → Application → Storage
- [ ] Verify data is being saved
- [ ] Try incognito mode (sync may be off)

### Problem: Video doesn't play
- [ ] Check internet connection
- [ ] Video source URL might be blocked
- [ ] CSS animation fallback should display
- [ ] Check console for error messages

### Problem: Audio doesn't play
- [ ] Browser may block autoplay
- [ ] Check volume on computer
- [ ] Try in non-incognito window
- [ ] Some networks block audio

## 📋 Performance Checklist

- [ ] Opening popup is instant (< 100ms)
- [ ] Overlay animation is smooth (60 FPS)
- [ ] No flickering or stuttering
- [ ] Close animation is smooth
- [ ] No lag when switching tabs
- [ ] Browser performance unchanged
- [ ] CPU usage minimal (background worker)

## 🔐 Security Checklist

- [ ] No external scripts loaded (only local files)
- [ ] No unrestricted CSS injection
- [ ] Content script filtered from restricted URLs
- [ ] Messages validated before processing
- [ ] No sensitive data stored

## 📱 Browser Compatibility

- [ ] Works in Chrome (88+)
- [ ] Works in Chromium-based browsers
- [ ] Tested on at least 2 websites
- [ ] Works in incognito mode
- [ ] Works in multiple tabs simultaneously

## 🎯 Final Sign-Off

Once all checks pass, your extension is ready to use!

- [ ] All basic tests passed
- [ ] Advanced verification successful
- [ ] No console errors
- [ ] Settings persist correctly
- [ ] Works on multiple websites
- [ ] Performance is good
- [ ] Ready to distribute or daily use

## 📝 Notes

Use this space to document any customizations or issues:

```
Custom Settings:
- Interval: ____ minutes
- Colors: ____________________
- Message: ____________________

Known Issues:
- ____________________
- ____________________

Customizations Made:
- ____________________
- ____________________
```

---

**Congratulations!** 🎉 Your Eye Break Helper extension is ready!

For further help, see:
- [README.md](README.md) - Overview and usage
- [QUICK_START.md](QUICK_START.md) - Quick setup guide
- [TECHNICAL_DOCS.md](TECHNICAL_DOCS.md) - Technical details
- [CUSTOMIZATION_GUIDE.md](CUSTOMIZATION_GUIDE.md) - How to customize

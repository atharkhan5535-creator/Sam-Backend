# 🏪 Salon ID Configuration Guide

## Problem
You're developing locally without a domain and need to test the frontend with different salon IDs (e.g., salon_id=10).

## ✅ Solution: Multiple Methods to Set Salon ID

---

## **Method 1: URL Query Parameter (Easiest for Testing)**

### Usage:
Append `?salon_id=X` to any page URL:

```
http://localhost/Sam-Backend/FRONTED/CUSTOMER/FRONTEND/index.html?salon_id=10
http://localhost/Sam-Backend/FRONTED/CUSTOMER/FRONTEND/html/services.html?salon_id=5
http://localhost/Sam-Backend/FRONTED/CUSTOMER/FRONTEND/html/packages.html?salon_id=2
```

### Features:
- ✅ Quick testing
- ✅ No configuration needed
- ✅ Works on any page
- ✅ Overrides localStorage

---

## **Method 2: Developer Switcher Tool (Recommended)**

### Access:
```
http://localhost/Sam-Backend/FRONTED/CUSTOMER/FRONTEND/salon-id-switcher.html
```

### Features:
- 🎯 Visual interface
- ⚡ Quick select buttons (Salon 1, 2, 3, 5, 10, 99)
- 📝 Custom input field
- 🔄 Reset to default
- 🏠 Direct link to home page

### How It Works:
1. Opens a control panel page
2. Shows current salon ID
3. Click quick-select buttons OR enter custom ID
4. Saves to localStorage
5. All pages now use the selected salon ID

---

## **Method 3: Browser Console (Quick Debug)**

Open browser DevTools (F12) and run:

```javascript
// Set salon ID
localStorage.setItem('salon_id', 10);
location.reload();

// Check current salon ID
console.log('Current salon_id:', localStorage.getItem('salon_id'));

// Reset to default
localStorage.removeItem('salon_id');
location.reload();
```

---

## **Method 4: Edit Config File (Permanent)**

**File:** `FRONTED/CUSTOMER/FRONTEND/Js/Core/config.js`

```javascript
// Change this line:
const salonId = urlParams.get('salon_id') || storedSalonId || 1;

// To:
const salonId = 10;  // Hardcoded to salon 10
```

⚠️ **Not recommended** - You'll need to edit the file every time you want to change.

---

## **Priority System**

The config uses this priority order:

```
1. URL parameter (?salon_id=X)  ← Highest priority
        ↓
2. localStorage ('salon_id')
        ↓
3. Default fallback (1)  ← Lowest priority
```

---

## **Testing Workflow**

### Scenario 1: Test Multiple Salons Quickly
```
1. Open: salon-id-switcher.html
2. Click "Salon 10"
3. Click "Go to Home"
4. Browse the site with salon 10 data
5. To switch: Back to switcher, pick different salon
```

### Scenario 2: Test Specific Page with Different Salon
```
1. Copy URL: .../html/services.html
2. Add parameter: .../html/services.html?salon_id=10
3. Open in browser
```

### Scenario 3: Persistent Testing Session
```
1. Open: salon-id-switcher.html
2. Set salon_id to 10
3. All navigation stays within salon 10
4. Close/reopen browser - still uses salon 10
5. To reset: Use switcher or clear localStorage
```

---

## **Files Modified/Created**

### Modified:
- `FRONTED/CUSTOMER/FRONTEND/Js/Core/config.js`
  - Added URL parameter support
  - Added localStorage persistence
  - Added debug logging

### Created:
- `FRONTED/CUSTOMER/FRONTEND/salon-id-switcher.html`
  - Developer tool for easy salon switching

---

## **Quick Reference**

| Task | Method | Example |
|------|--------|---------|
| Test salon 10 | URL | `?salon_id=10` |
| Test salon 5 | Switcher | Click "Salon 5" |
| Test salon 99 | Console | `localStorage.setItem('salon_id', 99)` |
| Reset to default | Switcher | Click "Reset to Default" |
| Check current ID | Console | `localStorage.getItem('salon_id')` |
| Clear storage | Console | `localStorage.removeItem('salon_id')` |

---

## **Debugging**

### Check Current Salon ID:
```javascript
// Browser console
console.log('Salon ID:', localStorage.getItem('salon_id'));
```

### View Config Loading:
Open browser console - you'll see:
```
[Config] Using salon_id: 10
```

### Clear All Storage:
```javascript
// Browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

---

## **Common Issues**

### Issue: Salon ID not changing
**Solution:** 
1. Check browser console for errors
2. Clear localStorage: `localStorage.clear()`
3. Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

### Issue: URL parameter ignored
**Solution:**
- URL parameter has highest priority
- Make sure format is correct: `?salon_id=10` (no spaces)
- Check browser address bar for typos

### Issue: Data not loading
**Solution:**
1. Verify salon exists in database: `SELECT * FROM salons WHERE salon_id = X`
2. Check backend API: `http://localhost/Sam-Backend/BACKEND/public/index.php/api/salon/info?salon_id=X`
3. Check CORS if using different ports

---

## **Production Deployment**

For production, you have two options:

### Option A: Remove Dynamic Salon ID
Edit `config.js`:
```javascript
// Fixed to salon 1 in production
const salonId = 1;
```

### Option B: Keep URL Parameter (Multi-tenant)
Keep current config - allows different salons via URL:
```
https://salon1.com/?salon_id=1
https://salon2.com/?salon_id=2
```

### Option C: Domain-based Salon Selection
Modify config to read from subdomain:
```javascript
// salon1.yourdomain.com → salon_id=1
// salon2.yourdomain.com → salon_id=2
const subdomain = window.location.hostname.split('.')[0];
const salonId = parseInt(subdomain) || 1;
```

---

## **Security Notes**

⚠️ **Important for Production:**

1. **Remove debug logging** in config.js:
   ```javascript
   // Remove or comment out:
   // console.log(`[Config] Using salon_id: ${salonId}`);
   ```

2. **Remove developer tools** (salon-id-switcher.html) or protect with authentication

3. **Validate salon_id** on backend (already implemented - checks salon exists)

4. **Consider rate limiting** on salon info endpoint

---

## **Summary**

| Method | Best For | Persistence | Ease |
|--------|----------|-------------|------|
| URL Parameter | Quick tests | No (per page) | ⭐⭐⭐⭐⭐ |
| Switcher Tool | Development sessions | Yes (localStorage) | ⭐⭐⭐⭐⭐ |
| Browser Console | Debugging | Yes (localStorage) | ⭐⭐⭐⭐ |
| Config Edit | Permanent change | Yes (code) | ⭐⭐ |

**Recommended:** Use **Switcher Tool** for development, **URL parameter** for quick tests.

---

**Status:** ✅ Implemented  
**Date:** 2026-03-19

# 🔧 Service Worker Redirect Fix

## Issue
The site `https://www.loanaticks.com/` was showing console errors:
> "The FetchEvent for 'https://www.loanaticks.com/' resulted in a network error response: a redirected response was used for a request whose redirect mode is not 'follow'."

## Root Cause
The service worker was intercepting fetch requests but not properly handling redirects. When `www.loanaticks.com` redirects to `loanaticks.com`, the service worker's fetch handler wasn't configured to follow redirects.

## Fix Applied
Updated `/public/sw.js` to:

1. **Handle navigation requests properly**: For page loads (`request.mode === 'navigate'`), explicitly set `redirect: 'follow'` to allow redirects
2. **Handle all redirects**: Added `redirect: 'follow'` to all fetch requests
3. **Don't cache redirects**: Prevent caching of redirected responses
4. **Updated cache version**: Changed from `v1` to `v2` to force browsers to update

## Changes Made

### Before:
```javascript
return fetch(event.request)  // No redirect handling
```

### After:
```javascript
// For navigation requests
fetch(request, {
  redirect: 'follow',
})

// For other requests
fetch(request, {
  redirect: 'follow',
})
```

## Deployment Steps

1. **Commit the changes:**
   ```bash
   git add public/sw.js
   git commit -m "Fix: Service worker redirect handling for www subdomain"
   git push origin main
   ```

2. **Wait for Vercel deployment** (2-5 minutes)

3. **Clear service worker cache** (users need to do this):
   - Open browser DevTools (F12)
   - Go to **Application** tab → **Service Workers**
   - Click **Unregister** for the old service worker
   - Or hard refresh: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)

4. **Verify fix:**
   - Visit `https://www.loanaticks.com/`
   - Check browser console - should see no redirect errors
   - Site should load normally

## Testing

After deployment, test:
- ✅ `https://www.loanaticks.com/` loads without errors
- ✅ `https://loanaticks.com/` loads normally
- ✅ No console errors about redirects
- ✅ Service worker registers successfully
- ✅ PWA features work (offline support, install prompt)

## Notes

- The cache version was bumped to `v2` to force browsers to download the new service worker
- Old cached service workers will be automatically cleaned up
- Users may need to hard refresh once to get the new service worker

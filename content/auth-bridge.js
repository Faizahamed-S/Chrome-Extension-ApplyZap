// Auth Bridge: Sync Supabase session token from localStorage to chrome.storage.sync

function findSupabaseToken() {
  // Scan localStorage for keys matching pattern: sb-*-auth-token
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          const data = JSON.parse(value);
          // Extract access_token from the parsed JSON
          if (data && data.access_token) {
            return data.access_token;
          }
        }
      } catch (e) {
        // Skip malformed JSON entries
        console.warn('Bridge: Failed to parse token from', key, e);
      }
    }
  }
  return null;
}

async function syncTokenToExtension() {
  const token = findSupabaseToken();
  if (token) {
    try {
      await new Promise((resolve) => {
        chrome.storage.sync.set({ applyZapToken: token }, () => {
          console.log("Bridge: Token synced to extension");
          resolve();
        });
      });
    } catch (e) {
      console.error('Bridge: Failed to save token to extension storage', e);
    }
  } else {
    // Clear token if not found (user logged out)
    try {
      await new Promise((resolve) => {
        chrome.storage.sync.remove('applyZapToken', () => resolve());
      });
    } catch (e) {
      console.error('Bridge: Failed to clear token from extension storage', e);
    }
  }
}

// Track last synced token to detect changes
let lastSyncedToken = null;

// Sync token on initial page load
syncTokenToExtension().then(() => {
  lastSyncedToken = findSupabaseToken();
});

// Monitor localStorage changes for token updates from other windows/tabs
window.addEventListener('storage', (e) => {
  // Check if the changed key matches our pattern
  if (e.key && e.key.startsWith('sb-') && e.key.endsWith('-auth-token')) {
    syncTokenToExtension().then(() => {
      lastSyncedToken = findSupabaseToken();
    });
  }
});

// Poll for same-window token changes (since storage event only fires cross-window)
// Check every 2 seconds for token updates
setInterval(() => {
  const currentToken = findSupabaseToken();
  // Only sync if token has changed
  if (currentToken !== lastSyncedToken) {
    syncTokenToExtension().then(() => {
      lastSyncedToken = currentToken;
    });
  }
}, 2000);

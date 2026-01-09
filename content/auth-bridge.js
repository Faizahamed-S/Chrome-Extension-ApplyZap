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

function syncToken() {
  const token = findSupabaseToken();
  
  if (token) {
    // Try to save the token
    chrome.storage.sync.set({ applyZapToken: token }, () => {
      if (chrome.runtime.lastError) {
        const errorMsg = chrome.runtime.lastError.message || '';
        // If context invalidated, just return (suppress the error)
        if (errorMsg.toLowerCase().includes('context invalidated')) {
          return;
        }
        // For other errors, log them
        console.error('Bridge: Failed to save token to extension storage', chrome.runtime.lastError);
        return;
      }
      console.log("Bridge: Token synced to extension");
    });
  } else {
    // No token found - clear it from storage
    chrome.storage.sync.remove('applyZapToken', () => {
      if (chrome.runtime.lastError) {
        const errorMsg = chrome.runtime.lastError.message || '';
        // If context invalidated, just return (suppress the error)
        if (errorMsg.toLowerCase().includes('context invalidated')) {
          return;
        }
        // For other errors, log them
        console.error('Bridge: Failed to clear token from extension storage', chrome.runtime.lastError);
        return;
      }
    });
  }
}

// Track last synced token to only sync on changes
let lastSyncedToken = null;

// Sync token on initial page load
syncToken();
lastSyncedToken = findSupabaseToken();

// Monitor localStorage changes for token updates from other windows/tabs
window.addEventListener('storage', (e) => {
  // Check if the changed key matches our pattern
  if (e.key && e.key.startsWith('sb-') && e.key.endsWith('-auth-token')) {
    syncToken();
    lastSyncedToken = findSupabaseToken();
  }
});

// Poll for same-window token changes (since storage event only fires cross-window)
// Check every 2 seconds for token updates
let pollInterval = setInterval(() => {
  try {
    // Check if extension was reloaded/killed
    if (!chrome.runtime || !chrome.runtime.id) {
      clearInterval(pollInterval);
      return;
    }
    
    const currentToken = findSupabaseToken();
    // Only sync if token has changed
    if (currentToken !== lastSyncedToken) {
      syncToken();
      lastSyncedToken = currentToken;
    }
  } catch (e) {
    // If accessing chrome.runtime.id throws an error, extension is dead
    clearInterval(pollInterval);
  }
}, 2000);

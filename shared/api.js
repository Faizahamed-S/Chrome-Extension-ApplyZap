// Production backend URL - hardcoded
const API_BASE_URL = "https://tracker-backend-production-535d.up.railway.app";

export async function getAuthToken() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["applyZapToken"], (result) => {
      resolve(result.applyZapToken || null);
    });
  });
}

export async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["apiBaseUrl"], (result) => {
      resolve({
        apiBaseUrl: result.apiBaseUrl || API_BASE_URL
      });
    });
  });
}

export async function saveSettings({ apiBaseUrl }) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ apiBaseUrl: apiBaseUrl || API_BASE_URL }, () => resolve());
  });
}

export async function postApplication(payload) {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("Please log in at applyzap-auth-buddy.lovable.app first.");
  }
  
  const url = `${API_BASE_URL.replace(/\/$/, "")}/board/applications`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try { message = await res.text(); } catch {}
    throw new Error(message);
  }
  return res.json().catch(() => ({}));
}

export async function testConnection() {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("Please log in at applyzap-auth-buddy.lovable.app first.");
  }
  
  const url = `${API_BASE_URL.replace(/\/$/, "")}/board/applications`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return true;
}

export async function getActiveTabInfo() {
  return new Promise((resolve) => {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs && tabs[0];
        resolve(tab ? { url: tab.url || "", title: tab.title || "" } : { url: "", title: "" });
      });
    } catch (e) {
      resolve({ url: "", title: "" });
    }
  });
}

export function openOptionsPage() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open("../options/options.html");
  }
}

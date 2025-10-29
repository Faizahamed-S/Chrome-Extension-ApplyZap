export async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["apiBaseUrl", "apiKey"], (result) => {
      resolve({
        apiBaseUrl: result.apiBaseUrl || "http://localhost:8080",
        apiKey: result.apiKey || ""
      });
    });
  });
}

export async function saveSettings({ apiBaseUrl, apiKey }) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ apiBaseUrl, apiKey }, () => resolve());
  });
}

export async function postApplication(payload) {
  const { apiBaseUrl, apiKey } = await getSettings();
  const url = `${apiBaseUrl.replace(/\/$/, "")}/api/applications`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { "Authorization": `Bearer ${apiKey}` } : {})
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
  const { apiBaseUrl, apiKey } = await getSettings();
  const url = `${apiBaseUrl.replace(/\/$/, "")}/actuator/health`;
  const res = await fetch(url, {
    headers: {
      ...(apiKey ? { "Authorization": `Bearer ${apiKey}` } : {})
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

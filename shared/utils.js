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

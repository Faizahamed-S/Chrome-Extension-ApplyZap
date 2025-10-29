// Placeholder for site-specific parsing (LinkedIn, Greenhouse, Lever, etc.)
// This script can expose a message handler to return parsed fields to the popup.

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message && message.type === "PARSE_CURRENT_PAGE") {
    // Future: implement DOM parsing here
    sendResponse({ ok: true, data: {} });
    return true;
  }
});

import { getAuthToken, testConnection } from "../shared/api.js";

const authStatus = document.getElementById("authStatus");
const authStatusText = document.getElementById("authStatusText");
const authDetails = document.getElementById("authDetails");
const testBtn = document.getElementById("testBtn");
const statusMsg = document.getElementById("statusMsg");

async function updateAuthStatus() {
  try {
    const token = await getAuthToken();
    if (token) {
      authStatusText.textContent = "Authenticated ✓";
      authStatus.className = "status-indicator ok";
      authDetails.innerHTML = `
        <p>Your session token is synced and ready to use.</p>
        <p><small>Token will automatically update when you log in/out on the web app.</small></p>
      `;
    } else {
      authStatusText.textContent = "Not Authenticated";
      authStatus.className = "status-indicator warn";
      authDetails.innerHTML = `
        <p>Please log in at <a href="https://applyzap-auth-buddy.lovable.app" target="_blank">applyzap-auth-buddy.lovable.app</a> to enable the extension.</p>
        <p><small>The token will sync automatically once you're logged in on that page.</small></p>
      `;
    }
  } catch (e) {
    authStatusText.textContent = "Error checking status";
    authStatus.className = "status-indicator warn";
    authDetails.textContent = `Error: ${e?.message || "Unknown error"}`;
  }
}

async function init() {
  await updateAuthStatus();
  
  // Refresh auth status every 2 seconds to catch token updates
  setInterval(updateAuthStatus, 2000);
}

testBtn.addEventListener("click", async () => {
  statusMsg.textContent = "Testing...";
  statusMsg.className = "status";
  try {
    await testConnection();
    statusMsg.textContent = "Connection successful!";
    statusMsg.className = "status ok";
    // Refresh auth status after successful test
    await updateAuthStatus();
  } catch (e) {
    statusMsg.textContent = `Failed: ${e?.message || "error"}`;
    statusMsg.className = "status warn";
  }
});

document.addEventListener("DOMContentLoaded", init);

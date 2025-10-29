import { saveSettings, getSettings, testConnection } from "../shared/api.js";

const apiBaseUrl = document.getElementById("apiBaseUrl");
const apiKey = document.getElementById("apiKey");
const saveBtn = document.getElementById("saveBtn");
const testBtn = document.getElementById("testBtn");
const statusMsg = document.getElementById("statusMsg");

async function init() {
  try {
    const settings = await getSettings();
    apiBaseUrl.value = settings.apiBaseUrl || "http://localhost:8080";
    apiKey.value = settings.apiKey || "";
  } catch (e) {
    // ignore
  }
}

saveBtn.addEventListener("click", async () => {
  statusMsg.textContent = "";
  await saveSettings({ apiBaseUrl: apiBaseUrl.value.trim(), apiKey: apiKey.value.trim() });
  statusMsg.textContent = "Saved";
});

testBtn.addEventListener("click", async () => {
  statusMsg.textContent = "Testing...";
  try {
    await testConnection();
    statusMsg.textContent = "OK";
  } catch (e) {
    statusMsg.textContent = `Failed: ${e?.message || "error"}`;
  }
});

document.addEventListener("DOMContentLoaded", init);

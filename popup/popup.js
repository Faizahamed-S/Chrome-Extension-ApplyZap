import { getActiveTabInfo, openOptionsPage } from "../shared/utils.js";
import { buildApplicationPayload } from "../shared/schema.js";
import { postApplication, getSettings } from "../shared/api.js";

function setTodayDate(input) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  input.value = `${yyyy}-${mm}-${dd}`;
}

function heuristicParseTitle(title) {
  // Attempt to split patterns like "Role – Company" or "Role - Company"
  const parts = title.split(/[–|-]/).map(p => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { roleName: parts[0], companyName: parts[1] };
  }
  return { roleName: "", companyName: "" };
}

async function init() {
  const form = document.getElementById("application-form");
  const companyName = document.getElementById("companyName");
  const roleName = document.getElementById("roleName");
  const dateOfApplication = document.getElementById("dateOfApplication");
  const jobLink = document.getElementById("jobLink");
  const tailored = document.getElementById("tailored");
  const jobDescription = document.getElementById("jobDescription");
  const referral = document.getElementById("referral");
  const status = document.getElementById("status");
  const statusMsg = document.getElementById("statusMsg");
  const openOptions = document.getElementById("openOptions");

  openOptions.addEventListener("click", (e) => {
    e.preventDefault();
    openOptionsPage();
  });

  setTodayDate(dateOfApplication);

  try {
    const tab = await getActiveTabInfo();
    if (tab && tab.url) {
      jobLink.value = tab.url;
    }
    if (tab && tab.title) {
      const guess = heuristicParseTitle(tab.title);
      if (guess.companyName && !companyName.value) companyName.value = guess.companyName;
      if (guess.roleName && !roleName.value) roleName.value = guess.roleName;
    }
  } catch (e) {
    // ignore autofill errors
  }

  try {
    const settings = await getSettings();
    if (!settings.apiBaseUrl || !settings.apiKey) {
      statusMsg.textContent = "Open Settings to configure API";
      statusMsg.classList.remove("ok");
      statusMsg.classList.add("warn");
    }
  } catch (e) {
    // ignore
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusMsg.textContent = "";
    statusMsg.classList.remove("ok", "warn");

    if (!companyName.value.trim() || !roleName.value.trim()) {
      statusMsg.textContent = "Company and Role are required";
      statusMsg.classList.add("warn");
      return;
    }

    const payload = buildApplicationPayload({
      companyName: companyName.value.trim(),
      roleName: roleName.value.trim(),
      dateOfApplication: dateOfApplication.value,
      jobLink: jobLink.value.trim(),
      tailored: !!tailored.checked,
      jobDescription: jobDescription.value.trim(),
      referral: !!referral.checked,
      status: status.value
    });

    const btn = document.getElementById("submitBtn");
    const prevText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Saving...";

    try {
      await postApplication(payload);
      statusMsg.textContent = "Saved";
      statusMsg.classList.remove("warn");
      statusMsg.classList.add("ok");
    } catch (err) {
      statusMsg.textContent = `Error: ${err?.message || "failed"}`;
      statusMsg.classList.remove("ok");
      statusMsg.classList.add("warn");
    } finally {
      btn.disabled = false;
      btn.textContent = prevText;
    }
  });
}

document.addEventListener("DOMContentLoaded", init);

import { getActiveTabInfo, openOptionsPage } from "../shared/utils.js";
import { buildApplicationPayload } from "../shared/schema.js";
import { postApplication, getAuthToken } from "../shared/api.js";

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
  const welcomeScreen = document.getElementById("welcome-screen");
  const formContainer = document.getElementById("form-container");
  
  // Check authentication status first
  let token = null;
  try {
    token = await getAuthToken();
  } catch (e) {
    // ignore
  }

  if (!token) {
    // Show welcome screen, hide form
    welcomeScreen.classList.remove("hidden");
    formContainer.classList.add("hidden");
    return; // Early return - don't initialize form
  }

  // User is authenticated - show form, hide welcome screen
  welcomeScreen.classList.add("hidden");
  formContainer.classList.remove("hidden");

  // Initialize form elements
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
  const successView = document.getElementById("success-view");
  const addAnotherBtn = document.getElementById("addAnotherBtn");
  const closeSuccessBtn = document.getElementById("closeSuccessBtn");

  // Function to resize window height dynamically
  function resizeWindow(height) {
    document.body.style.height = `${height}px`;
  }

  // Set initial window height for form view
  resizeWindow(600);

  if (openOptions) {
    openOptions.addEventListener("click", (e) => {
      e.preventDefault();
      try {
        openOptionsPage();
      } catch (err) {
        console.error("Failed to open options page:", err);
      }
    });
  }

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
      // Show success view, hide form, resize window
      successView.classList.remove("hidden");
      formContainer.classList.add("hidden");
      resizeWindow(300);
    } catch (err) {
      statusMsg.textContent = `Error: ${err?.message || "failed"}`;
      statusMsg.classList.remove("ok");
      statusMsg.classList.add("warn");
    } finally {
      btn.disabled = false;
      btn.textContent = prevText;
    }
  });

  // "Add Another" button handler
  addAnotherBtn.addEventListener("click", async () => {
    // Reset the form
    form.reset();
    
    // Set date field to today
    setTodayDate(dateOfApplication);
    
    // Try to refresh jobLink from current tab
    try {
      const tab = await getActiveTabInfo();
      if (tab && tab.url) {
        jobLink.value = tab.url;
      }
    } catch (e) {
      // Keep empty if tab info unavailable
    }

    // Hide success view, show form, resize window
    successView.classList.add("hidden");
    formContainer.classList.remove("hidden");
    resizeWindow(600);
    
    // Focus first input for quick entry
    companyName.focus();
  });

  // "Close" button handler - close the extension popup
  closeSuccessBtn.addEventListener("click", () => {
    window.close();
  });
}

document.addEventListener("DOMContentLoaded", init);

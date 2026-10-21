
const profileUrlsInput = document.getElementById("profileUrls");
const processUrlsButton = document.getElementById("processUrls");
const profileList = document.getElementById("profileList");
const urlStatus = document.getElementById("urlStatus");

const searchProfiles = document.getElementById("searchProfiles");
const clearProfilesButton = document.getElementById("clearProfiles");

const profileCount = document.getElementById("profileCount");
const validCount = document.getElementById("validCount");
const footerCount = document.getElementById("footerCount");
const emptyState = document.getElementById("emptyState");
const continueButton = document.getElementById("continueButton");

const profilesScreen = document.getElementById("profilesScreen");
const messageScreen = document.getElementById("messageScreen");
const backButton = document.getElementById("backButton");
const editRecipientsButton = document.getElementById("editRecipients");

const recipientList = document.getElementById("recipientList");
const recipientSummary = document.getElementById("recipientSummary");
const draftFooterCount = document.getElementById("draftFooterCount");

const messageTemplate = document.getElementById("messageTemplate");
const characterCount = document.getElementById("characterCount");
const clearDraftButton = document.getElementById("clearDraft");
const saveDraftButton = document.getElementById("saveDraft");
const draftStatus = document.getElementById("draftStatus");

const recipientCheck = document.getElementById("recipientCheck");
const messageCheck = document.getElementById("messageCheck");
const reviewButton = document.getElementById("reviewButton");

const messageModeInputs = document.querySelectorAll(
  'input[name="messageMode"]'
);

const modeCards = document.querySelectorAll(".mode-card");

let profiles = [];
let selectedUrls = new Set();
let savedDraft = "";

function isValidLinkedInProfile(urlString) {
  try {
    const url = new URL(urlString);

    return (
      url.protocol === "https:" &&
      url.hostname === "www.linkedin.com" &&
      /^\/in\/[^/]+\/?$/.test(url.pathname)
    );
  } catch {
    return false;
  }
}

function renderProfiles() {
  const searchTerm = searchProfiles.value.trim().toLowerCase();

  const filteredProfiles = profiles.filter((profile) =>
    profile.url.toLowerCase().includes(searchTerm)
  );

  profileList.replaceChildren();

  filteredProfiles.forEach((profile) => {
    const item = document.createElement("li");
    item.className = "profile-row";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = selectedUrls.has(profile.url);
    checkbox.setAttribute(
      "aria-label",
      `Select ${profile.url}`
    );

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        selectedUrls.add(profile.url);
      } else {
        selectedUrls.delete(profile.url);
      }

      updateContinueButton();
    });

    const details = document.createElement("div");
    details.className = "profile-details";

    const link = document.createElement("a");
    link.href = profile.url;
    link.textContent = profile.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    const status = document.createElement("div");
    status.textContent = profile.status;

    details.append(link, status);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "profile-action remove";
    removeButton.textContent = "Remove";

    removeButton.addEventListener("click", () => {
      profiles = profiles.filter(
        (entry) => entry.url !== profile.url
      );

      selectedUrls.delete(profile.url);

      renderProfiles();
    });

    const actions = document.createElement("div");
    actions.className = "profile-actions";
    actions.appendChild(removeButton);

    item.append(checkbox, details, actions);
    profileList.appendChild(item);
  });

  if (filteredProfiles.length === 0 && profiles.length > 0) {
    const item = document.createElement("li");
    item.className = "no-results";
    item.textContent = "No matching profiles found.";
    profileList.appendChild(item);
  }

  profileCount.textContent = profiles.length;

  validCount.textContent =
    `${profiles.length} valid profile(s) loaded`;

  footerCount.textContent =
    `${selectedUrls.size} recipient(s) selected`;

  emptyState.hidden = profiles.length > 0;

  updateContinueButton();
}

function updateContinueButton() {
  continueButton.disabled = selectedUrls.size === 0;
  footerCount.textContent =
    `${selectedUrls.size} recipient(s) selected`;
}

function showProfilesScreen() {
  messageScreen.hidden = true;
  profilesScreen.hidden = false;
}

function showMessageScreen() {
  const selectedProfiles = profiles.filter((profile) =>
    selectedUrls.has(profile.url)
  );

  if (selectedProfiles.length === 0) {
    urlStatus.textContent = "Select at least one profile first.";
    return;
  }

  renderRecipients();

  profilesScreen.hidden = true;
  messageScreen.hidden = false;

  updateDraftUI();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderRecipients() {
  recipientList.replaceChildren();

  const selectedProfiles = profiles.filter((profile) =>
    selectedUrls.has(profile.url)
  );

  selectedProfiles.forEach((profile) => {
    const item = document.createElement("li");

    const link = document.createElement("a");
    link.href = profile.url;
    link.textContent = profile.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    item.appendChild(link);
    recipientList.appendChild(item);
  });

  recipientSummary.textContent =
    `${selectedProfiles.length} recipient(s) selected`;

  draftFooterCount.textContent =
    `${selectedProfiles.length} recipient(s)`;
}

function updateDraftUI() {
  characterCount.textContent =
    `${messageTemplate.value.length} characters`;

  const hasRecipients = selectedUrls.size > 0;
  const hasMessage = messageTemplate.value.trim().length > 0;

  recipientCheck.textContent = hasRecipients ? "Ready" : "Pending";
  messageCheck.textContent = hasMessage ? "Ready" : "Pending";

  reviewButton.disabled = !(hasRecipients && hasMessage);
}

function updateSavedDraft() {
  savedDraft = messageTemplate.value;
  draftStatus.textContent = "Draft saved in this session.";
}

processUrlsButton.addEventListener("click", () => {
  const inputLines = profileUrlsInput.value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const uniqueUrls = [...new Set(inputLines)];
  const validUrls = uniqueUrls.filter(isValidLinkedInProfile);

  const invalidCount = uniqueUrls.length - validUrls.length;
  const duplicateCount = inputLines.length - uniqueUrls.length;

  profiles = validUrls.map((url) => ({
    url,
    status: "Ready for review"
  }));

  selectedUrls = new Set(validUrls);

  renderProfiles();

  urlStatus.textContent =
    `${validUrls.length} valid profile(s) loaded. ` +
    `${duplicateCount} duplicate(s) removed. ` +
    `${invalidCount} invalid URL(s) skipped.`;

  urlStatus.style.color =
    invalidCount > 0 ? "#b45353" : "#16835d";
});

searchProfiles.addEventListener("input", renderProfiles);

clearProfilesButton.addEventListener("click", () => {
  if (profiles.length === 0) return;

  if (!confirm("Remove all loaded profiles?")) return;

  profiles = [];
  selectedUrls.clear();

  profileUrlsInput.value = "";
  searchProfiles.value = "";

  renderProfiles();

  urlStatus.textContent = "All profiles have been cleared.";
});

messageModeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    modeCards.forEach((card) => {
      const radio = card.querySelector('input[type="radio"]');
      card.classList.toggle("selected", radio.checked);
    });
  });
});

continueButton.addEventListener("click", showMessageScreen);

backButton.addEventListener("click", showProfilesScreen);

editRecipientsButton.addEventListener("click", showProfilesScreen);

messageTemplate.addEventListener("input", updateDraftUI);

clearDraftButton.addEventListener("click", () => {
  messageTemplate.value = "";
  draftStatus.textContent = "Draft cleared.";
  updateDraftUI();
});

saveDraftButton.addEventListener("click", updateSavedDraft);

reviewButton.addEventListener("click", () => {
  if (!messageTemplate.value.trim() || selectedUrls.size === 0) {
    return;
  }

  updateSavedDraft();

  alert(
    `Draft reviewed for ${selectedUrls.size} recipient(s).\n\n` +
    "No LinkedIn messages have been sent."
  );
});

renderProfiles();
updateDraftUI();

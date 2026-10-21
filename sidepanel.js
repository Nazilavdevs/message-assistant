
const profileUrlsInput = document.getElementById("profileUrls");
const processUrlsButton = document.getElementById("processUrls");
const profileList = document.getElementById("profileList");
const urlStatus = document.getElementById("urlStatus");

const messageModeInputs = document.querySelectorAll(
  'input[name="messageMode"]'
);

const modeCards = document.querySelectorAll(".mode-card");

const profileCount = document.getElementById("profileCount");
const validCount = document.getElementById("validCount");
const footerCount = document.getElementById("footerCount");
const emptyState = document.getElementById("emptyState");
const continueButton = document.getElementById("continueButton");

let profiles = [];

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


const searchProfiles = document.getElementById("searchProfiles");
const clearProfilesButton = document.getElementById("clearProfiles");

function renderProfiles() {
  const searchTerm = searchProfiles.value.trim().toLowerCase();

  const filteredProfiles = profiles.filter((profile) =>
    profile.url.toLowerCase().includes(searchTerm)
  );

  profileList.replaceChildren();

  filteredProfiles.forEach((profile) => {
    const item = document.createElement("li");
    item.className = "profile-row";

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

    const actions = document.createElement("div");
    actions.className = "profile-actions";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "profile-action remove";
    removeButton.textContent = "Remove";
    removeButton.setAttribute(
      "aria-label",
      `Remove ${profile.url}`
    );

    removeButton.addEventListener("click", () => {
      profiles = profiles.filter(
        (entry) => entry.url !== profile.url
      );

      renderProfiles();
    });

    actions.appendChild(removeButton);
    item.append(details, actions);
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
    `${profiles.length} profile(s) ready`;

  emptyState.hidden = profiles.length > 0;

  continueButton.disabled = profiles.length === 0;
}

searchProfiles.addEventListener("input", renderProfiles);

clearProfilesButton.addEventListener("click", () => {
  if (profiles.length === 0) return;

  const confirmed = confirm(
    "Are you sure you want to remove all loaded profiles?"
  );

  if (!confirmed) return;

  profiles = [];
  profileUrlsInput.value = "";
  searchProfiles.value = "";

  renderProfiles();

  urlStatus.textContent = "All profiles have been cleared.";
});


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

  renderProfiles();

  urlStatus.textContent =
    `${validUrls.length} valid profile(s) loaded. ` +
    `${duplicateCount} duplicate(s) removed. ` +
    `${invalidCount} invalid URL(s) skipped.`;

  urlStatus.style.color =
    invalidCount > 0 ? "#b45353" : "#16835d";
});

messageModeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    modeCards.forEach((card) => {
      const radio = card.querySelector('input[type="radio"]');

      card.classList.toggle("selected", radio.checked);
    });
  });
});

renderProfiles();

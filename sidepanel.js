
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

function renderProfiles() {
  profileList.replaceChildren();

  profiles.forEach((profile) => {
    const item = document.createElement("li");

    const link = document.createElement("a");
    link.href = profile.url;
    link.textContent = profile.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    const status = document.createElement("div");
    status.textContent = profile.status;

    item.append(link, status);
    profileList.appendChild(item);
  });

  const count = profiles.length;

  profileCount.textContent = count;
  validCount.textContent =
    `${count} valid profile${count === 1 ? "" : "s"} loaded`;

  footerCount.textContent =
    `${count} profile${count === 1 ? "" : "s"} ready`;

  emptyState.hidden = count > 0;

  // Continue will be enabled when we implement the next workflow.
  continueButton.disabled = true;
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

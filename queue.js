
const sampleData = [
    {
        url: "https://www.linkedin.com/in/abhay-padhiyar/",
        context:
            "Technical Support Engineer at AVDEVS, Interested in .NET, Full Stack Development, Angular",
        action: "message",
    },
    {
        url: "https://www.linkedin.com/in/nimisha-dabhi-1a7128198/",
        context:
            "Technical Support Engineer at AVDEVS, Interested in React Native, React, Mobile Application Development",
        action: "message",
    },
    {
        url: "https://www.linkedin.com/in/simran-shaikh-2bb666290/",
        context:
            "Technical Support Engineer at AVDEVS, Interested in AI/ML, Data Science, GenAI",
        action: "message",
    },
];

// Queue state
let currentIndex = 0;
const completedProfiles = new Set();

// Screen elements
const profileListScreen = document.getElementById("profileListScreen");
const queueScreen = document.getElementById("queueScreen");
const completionScreen = document.getElementById("completeCard");

// Profile list elements
const profileList = document.getElementById("profileList");
const profileCount = document.getElementById("profileCount");
const startQueueButton = document.getElementById("startQueueButton");

// Current profile elements
const profileName = document.getElementById("profileName");
const profileUrl = document.getElementById("profileUrl");
const profileContext = document.getElementById("profileContext");
const taskBadge = document.getElementById("taskBadge");

// Progress elements
const progressText = document.getElementById("progressText");
const progressPercent = document.getElementById("progressPercent");
const progressBar = document.getElementById("progressBar");

// Buttons
const openProfileButton = document.getElementById("openProfile");
const previousButton = document.getElementById("previousProfile");
const nextButton = document.getElementById("nextProfile");
const restartButton = document.getElementById("restartQueue");
const startAgainButton = document.getElementById("startAgainButton");

// Other elements
const status = document.getElementById("status");
const completeSummary = document.getElementById("completeSummary");

// Extract a display name from a LinkedIn profile URL
function extractNameFromUrl(urlString) {
    try {
        const url = new URL(urlString);
        const slug = url.pathname
            .split("/")
            .filter(Boolean)
            .pop();

        if (!slug) {
            return "Unknown recipient";
        }

        // Remove a trailing alphanumeric identifier containing numbers.
        const nameSlug = slug.replace(/-[a-z0-9]*\d[a-z0-9]*$/i, "");

        // Convert "nazil-dhalwala" into "Nazil Dhalwala".
        return nameSlug
            .split("-")
            .filter(Boolean)
            .map((part) =>
                part.charAt(0).toUpperCase() + part.slice(1)
            )
            .join(" ") || "Unknown recipient";
    } catch {
        return "Unknown recipient";
    }
}

// Validate profile URLs before using them
function isValidProfile(profile) {
    try {
        const url = new URL(profile.url);

        return (
            url.protocol === "https:" &&
            url.hostname === "www.linkedin.com" &&
            url.pathname.startsWith("/in/") &&
            url.pathname.split("/").filter(Boolean).length >= 2
        );

    } catch {
        return false;
    }
}

// Build the initial list of profiles
function renderProfileList() {
    profileList.replaceChildren();

    const validProfiles = sampleData.filter(isValidProfile);

    profileCount.textContent =
        `${validProfiles.length} profile${validProfiles.length === 1 ? "" : "s"}`;

    validProfiles.forEach((profile) => {
        const item = document.createElement("article");
        item.className = "profile-item";

        const avatar = document.createElement("div");
        avatar.className = "profile-avatar";

        const name = extractNameFromUrl(profile.url);
        avatar.textContent = name.charAt(0) || "?";
        avatar.setAttribute("aria-hidden", "true");

        const content = document.createElement("div");
        content.className = "profile-item-content";

        const nameElement = document.createElement("p");
        nameElement.className = "profile-item-name";
        nameElement.textContent = name;

        const link = document.createElement("a");
        link.className = "profile-item-url";
        link.href = profile.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = profile.url;

        const task = document.createElement("span");
        task.className = "profile-item-task";
        task.textContent = profile.action || "Review";

        content.append(nameElement, link, task);
        item.append(avatar, content);
        profileList.appendChild(item);
    });

    startQueueButton.disabled = validProfiles.length === 0;
}

// Display the current profile
function renderProfile() {
    if (currentIndex >= sampleData.length) {
        showCompletionScreen();
        return;
    }

    const profile = sampleData[currentIndex];

    if (!isValidProfile(profile)) {
        status.textContent = "This profile has an invalid LinkedIn URL.";
        console.error("Invalid LinkedIn profile:", profile.url);
        return;
    }

    profileName.textContent = extractNameFromUrl(profile.url);

    profileUrl.textContent = profile.url;
    profileUrl.href = profile.url;

    profileContext.textContent =
        profile.context || "No context provided.";

    taskBadge.textContent = profile.action || "Review";

    // Calculate progress using completed profiles.
    const percentage = Math.round(
        (completedProfiles.size / sampleData.length) * 100
    );

    progressText.textContent =
        `Profile ${currentIndex + 1} of ${sampleData.length}`;

    progressPercent.textContent = `${percentage}%`;
    progressBar.style.width = `${percentage}%`;

    // Disable Previous on the first profile.
    previousButton.disabled = currentIndex === 0;

    // Change the label on the final profile.
    nextButton.textContent =
        currentIndex === sampleData.length - 1
            ? "Done & Finish ✓"
            : "Done & Next →";

    status.textContent = completedProfiles.has(currentIndex)
        ? "You have already marked this profile as completed."
        : "Review the profile and complete your task manually.";

    profileListScreen.hidden = true;
    queueScreen.hidden = false;
    completionScreen.hidden = true;
}

// Open the current profile in the active browser tab
async function openCurrentProfile() {
    if (
        currentIndex < 0 ||
        currentIndex >= sampleData.length
    ) {
        return false;
    }

    const profile = sampleData[currentIndex];

    if (!isValidProfile(profile)) {
        status.textContent = "Cannot open this invalid profile URL.";
        return false;
    }

    try {
        const tabs = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });

        if (tabs.length > 0 && tabs[0].id !== undefined) {
            await chrome.tabs.update(tabs[0].id, {
                url: profile.url,
            });
        } else {
            await chrome.tabs.create({
                url: profile.url,
                active: true,
            });
        }

        status.textContent =
            `Opened ${extractNameFromUrl(profile.url)}. Complete your task manually.`;

        return true;

    } catch (error) {
        console.error("Could not open LinkedIn profile:", error);

        status.textContent =
            "Could not open the profile. Check extension permissions.";

        return false;
    }
}

// Start the queue and automatically open the first profile
async function startQueue() {
    const firstValidIndex = sampleData.findIndex(isValidProfile);

    if (firstValidIndex === -1) {
        status.textContent = "No valid LinkedIn profiles were found.";
        return;
    }

    currentIndex = firstValidIndex;

    profileListScreen.hidden = true;
    completionScreen.hidden = true;
    queueScreen.hidden = false;

    renderProfile();

    // Automatically open the first profile.
    await openCurrentProfile();
}

// Mark the current profile complete and open the next one
async function completeAndNext() {
    if (currentIndex >= sampleData.length) {
        return;
    }

    completedProfiles.add(currentIndex);

    if (currentIndex < sampleData.length - 1) {
        currentIndex++;

        renderProfile();

        // Automatically navigate to the next LinkedIn profile.
        await openCurrentProfile();

    } else {
        showCompletionScreen();
    }
}

// Go back to the previous profile and open it
async function goToPreviousProfile() {
    if (currentIndex > 0 && currentIndex < sampleData.length) {
        currentIndex--;

        renderProfile();

        await openCurrentProfile();
    }
}

// Display the completion screen
function showCompletionScreen() {
    profileListScreen.hidden = true;
    queueScreen.hidden = true;
    completionScreen.hidden = false;

    const total = sampleData.length;
    const completed = completedProfiles.size;

    completeSummary.textContent =
        `You completed ${completed} of ${total} profiles. Great work!`;

    progressText.textContent = `Completed ${completed} of ${total} profiles`;
    progressPercent.textContent = "100%";
    progressBar.style.width = "100%";
}

// Return to the initial profile list and reset progress
function restartQueue() {
    currentIndex = 0;
    completedProfiles.clear();

    profileListScreen.hidden = false;
    queueScreen.hidden = true;
    completionScreen.hidden = true;

    renderProfileList();
}

// Button event listeners
startQueueButton.addEventListener("click", startQueue);

openProfileButton.addEventListener("click", openCurrentProfile);

nextButton.addEventListener("click", completeAndNext);

previousButton.addEventListener("click", goToPreviousProfile);

restartButton.addEventListener("click", restartQueue);

startAgainButton.addEventListener("click", restartQueue);

// Initial screen: show the list, not the first profile card.
renderProfileList();

profileListScreen.hidden = false;
queueScreen.hidden = true;
completionScreen.hidden = true;

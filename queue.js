
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

// Current position in the queue
let currentIndex = 0;

// Tracks completed profiles
const completedProfiles = new Set();

// Get HTML elements
const profileName = document.getElementById("profileName");
const profileUrl = document.getElementById("profileUrl");
const profileContext = document.getElementById("profileContext");
// const profileAction = document.getElementById("profileAction");
const taskBadge = document.getElementById("taskBadge");

const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");

const openProfileButton = document.getElementById("openProfile");
const previousButton = document.getElementById("previousProfile");
const nextButton = document.getElementById("nextProfile");
const restartButton = document.getElementById("restartQueue");
const startAgainButton = document.getElementById("startAgainButton")

const queueContent = document.getElementById("queueContent");
const completionScreen = document.getElementById("completeCard");

// Convert a LinkedIn profile URL into a display name
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

        // Remove a trailing numeric identifier, if present.
        const nameSlug = slug.replace(/-\d+$/, "");

        // Convert "abhay-padhiyar" into "Abhay Padhiyar".
        return nameSlug
            .split("-")
            .filter(Boolean)
            .map((part) =>
                part.charAt(0).toUpperCase() + part.slice(1)
            )
            .join(" ");
    } catch (error) {
        console.error("Invalid profile URL:", error);
        return "Unknown recipient";
    }
}

// Validate the profile data before displaying it
function isValidProfile(profile) {
    try {
        const url = new URL(profile.url);

        return (
            url.hostname === "www.linkedin.com" &&
            url.pathname.startsWith("/in/")
        );
    } catch {
        return false;
    }
}

// Update the queue UI for the current profile
function renderProfile() {
    if (currentIndex >= sampleData.length) {
        showCompletionScreen();
        return;
    }

    const profile = sampleData[currentIndex];

    if (!isValidProfile(profile)) {
        console.error("Invalid LinkedIn profile:", profile.url);
        return;
    }

    // Display profile information
    profileName.textContent = extractNameFromUrl(profile.url);
    profileUrl.textContent = profile.url;
    profileUrl.href = profile.url;
    profileContext.textContent = profile.context || "No context provided.";

    // profileAction.textContent = profile.action || "No action specified";

    // Update the task badge
    taskBadge.textContent =
        profile.action === "message"
            ? "Message"
            : profile.action || "Review";

    // Update progress
    progressText.textContent =
        `Profile ${currentIndex + 1} of ${sampleData.length}`;

    const progressPercentage =
        (completedProfiles.size / sampleData.length) * 100;

    progressBar.style.width = `${progressPercentage}%`;

    // Disable Previous on the first profile
    previousButton.disabled = currentIndex === 0;

    // Update Next button text
    nextButton.textContent =
        currentIndex === sampleData.length - 1
            ? "Done & Finish"
            : "Done & Next";

    // Show the queue
    queueContent.hidden = false;
    completionScreen.hidden = true;
}

// Display the completion screen
function showCompletionScreen() {
    queueContent.hidden = true;
    completionScreen.hidden = false;

    progressText.textContent =
        `Completed ${completedProfiles.size} of ${sampleData.length} profiles`;

    progressBar.style.width = "100%";
}

// Open the current LinkedIn profile in the active tab
async function openCurrentProfile() {
    if (currentIndex >= sampleData.length) {
        return;
    }

    const profile = sampleData[currentIndex];

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
    } catch (error) {
        console.error("Could not open LinkedIn profile:", error);
        alert("Could not open the profile. Please check the extension permissions.");
    }
}

// Mark the current profile as completed and move forward
function completeAndNext() {
    completedProfiles.add(currentIndex);
    
    if (currentIndex < sampleData.length - 1) {
        currentIndex++;
        renderProfile();
    } else {
        currentIndex = sampleData.length;
        showCompletionScreen();
    }
}

// Move to the previous profile
function goToPreviousProfile() {
    if (currentIndex > 0 && currentIndex < sampleData.length) {
        currentIndex--;
        renderProfile();
    }
}

// Restart the queue from the beginning
function restartQueue() {
    currentIndex = 0;
    completedProfiles.clear();
    renderProfile();
}

// Attach button event listeners
openProfileButton.addEventListener("click", openCurrentProfile);
nextButton.addEventListener("click", completeAndNext);
previousButton.addEventListener("click", goToPreviousProfile);
restartButton.addEventListener("click", restartQueue);
startAgainButton.addEventListener("click", restartQueue);

// Initial render
renderProfile();
let activePackProfile = StorageManager.loadPackProfile("main");
activePackProfile.addPack(TestData.createTestPack());
let quizQueueElement;

// Add custom items to the quiz queue
document.addEventListener("DOMContentLoaded", () => {
    // Get quiz queue array
    quizQueueElement = document.getElementById("quiz-queue").firstElementChild;
    let quizQueue = JSON.parse(quizQueueElement.innerHTML);
    // Add custom items to quiz queue
    quizQueue = activePackProfile.getActiveReviews().concat(quizQueue);
    // Update quiz queue
    quizQueueElement.innerHTML = JSON.stringify(quizQueue);
});

// Catch submission fetch and stop it if submitted item is a custom item
const { fetch: originalFetch } = unsafeWindow;
unsafeWindow.fetch = async (...args) => {
    let [resource, config] = args;
    if (resource.includes("/subjects/review") && config.method === "POST") {
        let payload = JSON.parse(config.body);
        // Check if submitted item is a custom item
        if(payload.counts && payload.counts[0].id < 0) {
            // Update custom item SRS
            activePackProfile.submitReview(payload.counts[0].id, payload.counts[0].meaning_incorrect, payload.counts[0].reading_incorrect);
            return new Response("{}", { status: 200 });
        } else {
            return originalFetch(...args);
        }
    } else {
        return originalFetch(...args);
    }
};

// ---------- Utility functions ----------
function updatePopupContent() {
    // Overview tab
    document.querySelector("#tab-1__content").lastElementChild.innerHTML = "Reviews: " + activePackProfile.getActiveReviews().length;
    // Packs tab
    let packsTab = document.querySelector("#tab-2__content");
    packsTab.innerHTML = "";
    for(let i = 0; i < activePackProfile.customPacks.length; i++) {
        let pack = activePackProfile.customPacks[i];
        let packElement = document.createElement("div");
        packElement.classList = "pack";
        packElement.innerHTML = `
            <h3>${pack.name}: <span>${pack.items.length} items</span></h3>
            <button class="fa-regular fa-trash"></button>
        `;
        packElement.querySelector("button").onclick = () => {
            activePackProfile.removePack(i);
            StorageManager.savePackProfile(activePackProfile, "main");
            updatePopupContent();
        };
        packsTab.appendChild(packElement);
    }
}
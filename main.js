let activePackProfile = await StorageManager.loadPackProfile("main");
await StorageManager.loadSettings();
let quizStatsController;

// ----------- If on review page -----------
if (window.location.pathname.includes("/review")) {
    if(activePackProfile.getNumActiveReviews() === 0) return;

    // Add style to root to prevent header flash
    let headerStyle = document.createElement("style");
    headerStyle.innerHTML = `
    .character-header__characters {
        opacity: 0;
        transition: opacity 0.2s;
    }
    .character-header__loaded .character-header__characters {
        opacity: 1;
    }
    `;
    document.head.append(headerStyle);

    // Add custom items to the quiz queue
    document.addEventListener("DOMContentLoaded", () => {
        let queueEl = document.getElementById('quiz-queue');
        let parentEl = queueEl.parentElement;
        queueEl.remove();
        let cloneEl = queueEl.cloneNode(true);

        let queueElement = JSON.parse(cloneEl.querySelector("script[data-quiz-queue-target='subjects']").innerHTML);
        let SRSElement = JSON.parse(cloneEl.querySelector("script[data-quiz-queue-target='subjectIdsWithSRS']").innerHTML);
        if((CustomSRSSettings.savedData.capturedWKReview && queueElement[0].id != CustomSRSSettings.savedData.capturedWKReview.id) || queueElement.length === 1) {
            CustomSRSSettings.savedData.capturedWKReview = queueElement.shift();
            SRSElement.shift();
        } else {
            CustomSRSSettings.savedData.capturedWKReview = queueElement[1];
            queueElement.splice(1, 1);
            SRSElement.splice(1, 1);
        }
        queueElement = activePackProfile.getActiveReviews().concat(queueElement);
        cloneEl.querySelector("script[data-quiz-queue-target='subjects']").innerHTML = JSON.stringify(queueElement);

        SRSElement = JSON.parse("[" + activePackProfile.getActiveReviewsSRS().join(",") + "]").concat(SRSElement);
        cloneEl.querySelector("script[data-quiz-queue-target='subjectIdsWithSRS']").innerHTML = JSON.stringify(SRSElement);

        parentEl.appendChild(cloneEl);

        StorageManager.saveSettings();

        let headerElement = document.querySelector(".character-header");
        for(className of headerElement.classList) { // Fix header colour issues
            if(className.includes("character-header--")) {
                headerElement.classList.remove(className);
                headerElement.classList.add("character-header--" + activePackProfile.getActiveReviews()[0].subject_category.toLowerCase());
                setTimeout(() => {
                    headerElement.classList.add("character-header__loaded");
                }, 500);
                break;
            }
        }

        loadControllers();
    });

    // Catch submission fetch and stop it if submitted item is a custom item
    const { fetch: originalFetch } = unsafeWindow;
    unsafeWindow.fetch = async (...args) => {
        let [resource, config] = args;
        if (resource.includes("/subjects/review") && config != null && config.method === "POST") {
            let payload = JSON.parse(config.body);
            // Check if submitted item is a custom item
            if(payload.counts && payload.counts[0].id < 0) {
                // Update custom item SRS
                activePackProfile.submitReview(payload.counts[0].id, payload.counts[0].meaning, payload.counts[0].reading);
                return new Response("{}", { status: 200 });
            } else {
                if(payload.counts[0].id == CustomSRSSettings.savedData.capturedWKReview.id) { // Check if somehow the captured WK review is being submitted
                    CustomSRSSettings.savedData.capturedWKReview = null;
                    StorageManager.saveSettings();
                }
                return originalFetch(...args);
            }
        // Catch subject info fetch and return custom item details if the number at the end of the url is negative
        } else if (resource.includes("/subject_info/") && config && config.method === "get" && resource.split("/").pop() < 0) {
            // Submit original fetch but to different URL to get usable headers
            args[0] = "https://www.wanikani.com/subject_info/1";
            let response = await originalFetch(...args);
            let subjectId = resource.split("/").pop();
            let subjectInfo = activePackProfile.getSubjectInfo(subjectId);
            return new Response(subjectInfo, {
                status: response.status,
                headers: response.headers
            });
        } else {
            return originalFetch(...args);
        }
    };

// ----------- If on lessons page -----------
} else if (window.location.pathname.includes("/lessons")) {
    // TODO

// ----------- If on dashboard page -----------
} else if (window.location.pathname.includes("/dashboard") || window.location.pathname === "/") {
    // Catch lesson / review count fetch and update it with custom item count
    const { fetch: originalFetch } = unsafeWindow;
    unsafeWindow.fetch = async (...args) => {
        let [resource, config] = args;
        if (resource.includes("lesson-and-review-count") && config != null && config.method === "get") {
            let response = await originalFetch(...args);
            let data = await response.text();
            data = parseHTML(data);

            let reviewCountElement = data.querySelector("a[href='/subjects/review'] .lesson-and-review-count__count");
            // If reviewCountElement is null, replace the span .lesson-and-review-count__item with some custom HTML
            if(reviewCountElement === null && activePackProfile.getNumActiveReviews() > 0) {
                let reviewTile = data.querySelector(".lesson-and-review-count__item:nth-child(2)");
                let customHTML = `
                <a class="lesson-and-review-count__item" target="_top" href="/subjects/review">
                    <div class="lesson-and-review-count__count">${activePackProfile.getNumActiveReviews()}</div>
                    <div class="lesson-and-review-count__label">Reviews</div>
                </a>
                `;
                reviewTile.outerHTML = customHTML;
            } else {
                if(activePackProfile.getNumActiveReviews() > 0) reviewCountElement.innerHTML = parseInt(reviewCountElement.innerHTML) + activePackProfile.getNumActiveReviews() + (CustomSRSSettings.savedData.capturedWKReview ? -1 : 0);
                else {
                    let reviewTile = data.querySelector(".lesson-and-review-count__item:nth-child(2)");
                    reviewTile.outerHTML = `
                    <span class="lesson-and-review-count__item" target="_top">
                        <div class="lesson-and-review-count__count lesson-and-review-count__count--zero">0</div>
                        <div class="lesson-and-review-count__label">Reviews</div>
                    </span>
                    `;
                }
            }

            // Convert the DocumentFragment back to a string and return it as a Response
            let serializedData = (new XMLSerializer()).serializeToString(data);
            let res = new Response(serializedData, {
                status: response.status,
                headers: response.headers
            });
            return res;
        } else {
            return originalFetch(...args);
        }
    };
    // Catch document load to edit review count on dashboard
    document.addEventListener("DOMContentLoaded", () => {
        let reviewNumberElement = document.querySelector(".reviews-dashboard .reviews-dashboard__count-text span");
        reviewNumberElement.innerHTML = parseInt(reviewNumberElement.innerHTML) + activePackProfile.getNumActiveReviews() + (CustomSRSSettings.savedData.capturedWKReview ? -1 : 0);
        console.log("Captured review item: " + CustomSRSSettings.savedData.capturedWKReview);

        let reviewTile = document.querySelector("div.reviews-dashboard");
        if(reviewTile.querySelector(".reviews-dashboard__buttons") === null && activePackProfile.getNumActiveReviews() > 0) { // If failed to catch WK review and custom items are due, display error message
            reviewTile.querySelector(".reviews-dashboard__text .wk-text").innerHTML = "CustomSRS Error. Please wait for WK review item to be available.";
        } else if(parseInt(reviewTile.querySelector(".count-bubble").innerHTML) === 0) { // If no custom items are due, update review tile to remove buttons
            reviewTile.querySelector(".reviews-dashboard__buttons").remove();
            reviewTile.classList.add("reviews-dashboard--complete");
            reviewTile.querySelector(".reviews-dashboard__text .wk-text").innerHTML = "There are no more reviews to do right now.";
        }
    });
}

// ----------- UTILITIES -----------
function parseHTML(html) {
    var t = document.createElement('template');
    t.innerHTML = html;
    return t.content;
}

async function loadControllers() {
    quizStatsController = await Utils.get_controller('quiz-statistics');
    quizStatsController.remainingCountTarget.innerText = parseInt(quizStatsController.remainingCountTarget.innerText) + activePackProfile.getNumActiveReviews();
}
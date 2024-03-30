let activePackProfile = await StorageManager.loadPackProfile("main");
await StorageManager.loadSettings();
let quizStatsController;

// ----------- If on review page -----------
if (window.location.pathname.includes("/review")) {
    let urlParams = new URLSearchParams(window.location.search);

    if(urlParams.has("conjugations") || activePackProfile.getNumActiveReviews() !== 0) {
        // Add style to root to prevent header flash
        let headerStyle = document.createElement("style");
        headerStyle.innerHTML = `
        .character-header .character-header__characters {
            opacity: 0;
        }
        .character-header--loaded .character-header__characters {
            opacity: 1;
            transition: opacity 0.1s;
        }
        `;
        document.head.append(headerStyle);
    }

    // Add custom items to the quiz queue and update captured WK review
    document.addEventListener("DOMContentLoaded", async () => {
        let changedFirstItem = false;
        let queueEl = document.getElementById('quiz-queue');
        let parentEl = queueEl.parentElement;
        queueEl.remove();
        let cloneEl = queueEl.cloneNode(true);
        let SRSElement, queueElement;

        // Check if there's a parameter "conjugations" in the URL
        if(urlParams.has("conjugations")) {
            let verbs = await Conjugations.getConjugationSessionItems(CustomSRSSettings.userSettings.conjGrammarSessionLength);
            console.log("CustomSRS: Conjugations loaded.");
            queueElement = verbs[0];
            SRSElement = verbs[1];
        } else if(urlParams.has("grammar")) {
            // TODO
        } else {
            queueElement = JSON.parse(cloneEl.querySelector("script[data-quiz-queue-target='subjects']").innerHTML);
            SRSElement = JSON.parse(cloneEl.querySelector("script[data-quiz-queue-target='subjectIdsWithSRS']").innerHTML);
            // Remove captured WK review from queue
            if(queueElement.length === 1 || (CustomSRSSettings.savedData.capturedWKReview && queueElement[1].id === CustomSRSSettings.savedData.capturedWKReview.id)) {
                CustomSRSSettings.savedData.capturedWKReview = queueElement.shift();
                SRSElement.shift();
                changedFirstItem = true;
                console.log("CustomSRS: Captured first item from queue.");
            } else {
                CustomSRSSettings.savedData.capturedWKReview = queueElement[1];
                queueElement.splice(1, 1);
                SRSElement.splice(1, 1);
                console.log("CustomSRS: Captured second item from queue.");
            }

            // Add custom items to queue
            if(activePackProfile.getNumActiveReviews() !== 0) {
                switch(CustomSRSSettings.userSettings.itemQueueMode) {
                    case "weighted-start":
                        let reviewsToAddW = activePackProfile.getActiveReviews();
                        let reviewsSRSToAddW = activePackProfile.getActiveReviewsSRS();
                        for(let i = 0; i < reviewsToAddW.length; i++) {
                            let pos = Math.floor(Math.random() * queueElement.length / 4);
                            if(pos === 0) changedFirstItem = true;
                            queueElement.splice(pos, 0, reviewsToAddW[i]);
                            SRSElement.splice(pos, 0, reviewsSRSToAddW[i]);
                        }
                        break;
                    case "random":
                        let reviewsToAdd = activePackProfile.getActiveReviews();
                        let reviewsSRSToAdd = activePackProfile.getActiveReviewsSRS();
                        for(let i = 0; i < reviewsToAdd.length; i++) {
                            let pos = Math.floor(Math.random() * queueElement.length);
                            if(pos === 0) changedFirstItem = true;
                            queueElement.splice(pos, 0, reviewsToAdd[i]);
                            SRSElement.splice(pos, 0, reviewsSRSToAdd[i]);
                        }
                        break;
                    case "start":
                        changedFirstItem = true;
                        queueElement = activePackProfile.getActiveReviews().concat(queueElement);
                        SRSElement = activePackProfile.getActiveReviewsSRS().concat(SRSElement);
                        break;
                }
            }

            StorageManager.saveSettings();
        }

        cloneEl.querySelector("script[data-quiz-queue-target='subjects']").innerHTML = JSON.stringify(queueElement);
        cloneEl.querySelector("script[data-quiz-queue-target='subjectIdsWithSRS']").innerHTML = JSON.stringify(SRSElement);
        parentEl.appendChild(cloneEl);

        if(changedFirstItem) {
            let headerElement = document.querySelector(".character-header");
            //headerElement.classList.add("character-header__loading");
            for(let className of headerElement.classList) { // Fix header colour issues
                if(className.includes("character-header--")) {
                    setTimeout(() => {
                        headerElement.classList.add("character-header--loaded");
                    }, 400);
                    break;
                }
            }
        }

        if(urlParams.has("conjugations")) {
            await Conjugations.setUpControllers();
            console.log("CustomSRS: Controller set up for conjugations.");
            setTimeout(() => {
                document.querySelector(".character-header").classList.add("character-header--loaded");
            }, 200);
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
                // Check if url includes ?conjugations
                if(window.location.search.includes("conjugations")) {
                    return new Response("{}", { status: 200 });
                } else {
                    // Update custom item SRS
                    activePackProfile.submitReview(payload.counts[0].id, payload.counts[0].meaning, payload.counts[0].reading);
                    return new Response("{}", { status: 200 });
                }
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
            let subjectInfo;
            if(window.location.search.includes("conjugations")) subjectInfo = Conjugations.getSubjectInfo(subjectId);
            else subjectInfo = activePackProfile.getSubjectInfo(subjectId);

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
            let res = new Response(updateLessonReviewCountData(data), {
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
        console.log("Captured review item: " + (CustomSRSSettings.savedData.capturedWKReview ? CustomSRSSettings.savedData.capturedWKReview.id : "none"));

        let reviewTile = document.querySelector("div.reviews-dashboard");
        if(reviewTile.querySelector(".reviews-dashboard__buttons") === null && activePackProfile.getNumActiveReviews() > 0) { // If failed to catch WK review and custom items are due, display error message
            reviewTile.querySelector(".reviews-dashboard__text .wk-text").innerHTML = "CustomSRS Error. Please wait for WK review item to be available.";
        } else if(parseInt(reviewTile.querySelector(".count-bubble").innerHTML) === 0) { // If no custom items are due, update review tile to remove buttons
            reviewTile.querySelector(".reviews-dashboard__buttons").remove();
            reviewTile.classList.add("reviews-dashboard--complete");
            reviewTile.querySelector(".reviews-dashboard__text .wk-text").innerHTML = "There are no more reviews to do right now.";
        }
    });

    // Update the stored user level
    let response = await Utils.wkAPIRequest("user");
    if(response && response.data && response.data.level) {
        CustomSRSSettings.userSettings.lastKnownLevel = response.data.level;
        StorageManager.saveSettings();
    }
} else {
    // Catch lesson / review count fetch and update it with custom item count
    const { fetch: originalFetch } = unsafeWindow;
    unsafeWindow.fetch = async (...args) => {
        let [resource, config] = args;
        if (resource.includes("lesson-and-review-count") && config != null && config.method === "get") {
            let response = await originalFetch(...args);
            let data = await response.text();
            let res = new Response(updateLessonReviewCountData(data), {
                status: response.status,
                headers: response.headers
            });
            return res;
        } else {
            return originalFetch(...args);
        }
    };

    // Add event listener for turbo:load, then check if the site address includes /radicals /kanji or /vocabulary
    document.addEventListener("turbo:frame-load", () => {
        if(window.location.pathname.includes("/radicals/") || window.location.pathname.includes("/kanji/") || window.location.pathname.includes("/vocabulary/")) {
            // Use the meta tag in the header with name subject_id to get the subject ID
            let itemHeader = document.querySelector("header.page-header");
            if(itemHeader.querySelector("h3")) itemHeader.querySelector("h3").innerText = "ID: " + document.querySelector("meta[name='subject_id']").content;
            else itemHeader.innerHTML += "<h3> ID: " + document.querySelector("meta[name='subject_id']").content + "</h3>";
        }
    });
}

// ----------- UTILITIES -----------
function parseHTML(html) {
    var t = document.createElement('template');
    t.innerHTML = html;
    return t.content;
}

function updateLessonReviewCountData(data) {
    data = parseHTML(data);

    let reviewCountElement = data.querySelector("a[href='/subjects/review'] .lesson-and-review-count__count");
    // If reviewCountElement is null, replace the span .lesson-and-review-count__item with some custom HTML
    let numActiveReviews = activePackProfile.getNumActiveReviews();
    if(reviewCountElement === null && numActiveReviews > 0) {
        let reviewTile = data.querySelector(".lesson-and-review-count__item:nth-child(2)");
        reviewTile.outerHTML = `
        <a class="lesson-and-review-count__item" target="_top" href="/subjects/review">
            <div class="lesson-and-review-count__count">${numActiveReviews}</div>
            <div class="lesson-and-review-count__label">Reviews</div>
        </a>
        `;
    } else {
        if(numActiveReviews > 0 || (!CustomSRSSettings.savedData.capturedWKReview && parseInt(reviewCountElement.innerHTML) > 0) || parseInt(reviewCountElement.innerHTML) > 1) reviewCountElement.innerHTML = parseInt(reviewCountElement.innerHTML) + numActiveReviews + (CustomSRSSettings.savedData.capturedWKReview ? -1 : 0);
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
    return (new XMLSerializer()).serializeToString(data);
}

async function loadControllers() {
    quizStatsController = await Utils.get_controller('quiz-statistics');
    quizStatsController.remainingCountTarget.innerText = parseInt(quizStatsController.remainingCountTarget.innerText) + (CustomSRSSettings.savedData.capturedWKReview ? -1 : 0) + ((new URLSearchParams(window.location.search)).has("conjugations") ? CustomSRSSettings.userSettings.conjGrammarSessionLength : activePackProfile.getNumActiveReviews());
}
if(stopRemainingScriptLoad) return;

let activePackProfile = await StorageManager.loadPackProfile("main");
let quizStatsController;

// ----------- If on review page -----------
if (window.location.pathname.includes("/review") || (window.location.pathname.includes("/extra_study") && window.location.search.includes("audio"))) {
    let urlParams = new URLSearchParams(window.location.search);

    if(activePackProfile.getNumActiveReviews() !== 0 || urlParams.has("conjugations") || urlParams.has("audio")) {
        // Add style to root to prevent header flash
        let headerStyle = document.createElement("style");
        headerStyle.id = "custom-srs-header-style";
        headerStyle.innerHTML = `
        .character-header__loading {
            .character-header__characters {
                opacity: 0;
                transition: opacity 0.05s;
            }
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

        // Switch based on review session type
        if(urlParams.has("conjugations")) {
            let verbs = await Conjugations.getConjugationSessionItems(CustomSRSSettings.userSettings.conjGrammarSessionLength);
            queueElement = verbs[0];
            SRSElement = verbs[1];
            changedFirstItem = true;
        } else if(urlParams.has("audio")) {
            queueElement = JSON.parse(cloneEl.querySelector("script[data-quiz-queue-target='subjects']").innerHTML);
            SRSElement = JSON.parse(cloneEl.querySelector("script[data-quiz-queue-target='subjectIds']").innerHTML);
            for(let i = queueElement.length - 1; i >= 0; i--) {
                if(queueElement[i].subject_category !== "Vocabulary" && queueElement[i].subject_category !== "KanaVocabulary") {
                    queueElement.splice(i, 1);
                    SRSElement.splice(i, 1);
                    if(i === 0) changedFirstItem = true;
                }
            }
            if(queueElement.length === 0) {
                alert("No vocabulary items found in burned items. Please try again after burning some vocabulary items.");
                window.location.href = "https://www.wanikani.com/dashboard";
                return;
            }

            document.querySelector(".character-header__content").appendChild(AudioQuiz.setUpAudioQuizHTML());
        } else {
            queueElement = JSON.parse(cloneEl.querySelector("script[data-quiz-queue-target='subjects']").innerHTML);
            SRSElement = JSON.parse(cloneEl.querySelector("script[data-quiz-queue-target='subjectIdsWithSRS']").innerHTML);

            if(!urlParams.has("custom")) {
                // Capture WK review from queue
                let settings = {"Radical": CustomSRSSettings.userSettings.enableRadicalCapture, "Kanji": CustomSRSSettings.userSettings.enableKanjiCapture, "Vocabulary": CustomSRSSettings.userSettings.enableVocabCapture};
                if(settings.Radical || settings.Kanji || settings.Vocabulary) {
                    queueElement.findLast((item, index) => {
                        if((!CustomSRSSettings.savedData.capturedWKReview || item.id !== CustomSRSSettings.savedData.capturedWKReview.id) && settings[item.subject_category]) {
                            CustomSRSSettings.savedData.capturedWKReview = item;
                            queueElement.splice(index, 1);
                            SRSElement.splice(index, 1);
                            if(index === 0) changedFirstItem = true;
                            Utils.log("Captured item " + index + " from queue.");
                            return true;
                        }
                    });
                }
            }

            // Add custom items to queue
            if(activePackProfile.getNumActiveReviews() !== 0) {
                // if url param is set to "custom" then set queue to only custom items
                if(urlParams.has("custom")) {
                    queueElement = activePackProfile.getActiveReviews();
                    SRSElement = activePackProfile.getActiveReviewsSRS();
                    changedFirstItem = true;
                } else {
                    switch(CustomSRSSettings.userSettings.itemQueueMode) {
                        case "weighted-start": {
                            let reviewsToAddW = activePackProfile.getActiveReviews();
                            let reviewsSRSToAddW = activePackProfile.getActiveReviewsSRS();
                            for(let i = 0; i < reviewsToAddW.length; i++) {
                                let pos = Math.floor(Math.random() * queueElement.length / 4);
                                if(pos === 0) changedFirstItem = true;
                                queueElement.splice(pos, 0, reviewsToAddW[i]);
                                SRSElement.splice(pos, 0, reviewsSRSToAddW[i]);
                            }
                            break;
                        } case "random": {
                            let reviewsToAdd = activePackProfile.getActiveReviews();
                            let reviewsSRSToAdd = activePackProfile.getActiveReviewsSRS();
                            for(let i = 0; i < reviewsToAdd.length; i++) {
                                let pos = Math.floor(Math.random() * queueElement.length);
                                if(pos === 0) changedFirstItem = true;
                                queueElement.splice(pos, 0, reviewsToAdd[i]);
                                SRSElement.splice(pos, 0, reviewsSRSToAdd[i]);
                            }
                            break;
                        } case "start":
                            changedFirstItem = true;
                            queueElement = activePackProfile.getActiveReviews().concat(queueElement);
                            SRSElement = activePackProfile.getActiveReviewsSRS().concat(SRSElement);
                            break;
                    }
                }
            }

            StorageManager.saveSettings();
        }

        if(changedFirstItem) document.querySelector(".character-header").classList.add("character-header__loading");

        cloneEl.querySelector("script[data-quiz-queue-target='subjects']").innerHTML = JSON.stringify(queueElement);
        if(!urlParams.has("audio")) cloneEl.querySelector("script[data-quiz-queue-target='subjectIdsWithSRS']").innerHTML = JSON.stringify(SRSElement);
        else cloneEl.querySelector("script[data-quiz-queue-target='subjectIds']").innerHTML = JSON.stringify(SRSElement);
        parentEl.appendChild(cloneEl);

        if(changedFirstItem) {
            let headerElement = document.querySelector(".character-header");
            for(let className of headerElement.classList) { // Fix header colour issues
                if(className.includes("character-header--")) {
                    headerElement.classList.remove(className);
                    document.querySelector(".quiz-input__input").setAttribute("placeholder", (document.querySelector(".quiz-input__question-type").innerText.includes("reading") ? "答え" : "Your Response"));
                    setTimeout(() => {
                        headerElement.classList.remove("character-header__loading");
                    }, 400);
                    break;
                }
            }
        }

        if(urlParams.has("conjugations")) {
            await Utils.setReadingsOnly();
            Utils.log("Controller set up for conjugations.");
            setTimeout(() => {
                document.querySelector(".character-header").classList.add("character-header--loaded");
            }, 200);
        } else {
            if(urlParams.has("audio")) Utils.setMeaningsOnly();
            loadControllers();
        }
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
                    SyncManager.setDidReview();
                    return new Response("{}", { status: 200 });
                }
            } else {
                if(payload.counts[0].id == CustomSRSSettings.savedData.capturedWKReview?.id) { // Check if somehow the captured WK review is being submitted
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

// ----------- If on dashboard page -----------
} else if (window.location.pathname.includes("/dashboard") || window.location.pathname === "/") {
    // Catch lesson / review count fetch and update it with custom item count
    const { fetch: originalFetch } = unsafeWindow;
    unsafeWindow.fetch = async (...args) => {
        let [resource, config] = args;
        if (resource.includes("lesson-and-review-count") && config != null && config.method === "get") {
            let response = await originalFetch(...args);
            let data = await response.text();
            return new Response(updateLessonReviewCountData(data), {
                status: response.status,
                headers: response.headers
            });
        } else if(resource.includes("review-forecast") && config != null && config.method === "get" && CustomSRSSettings.savedData.capturedWKReview) {
            let response = await originalFetch(...args);
            let dataText = await response.text();
            let parser = new DOMParser();
            let doc = parser.parseFromString(dataText, 'text/html');
            for(counter of doc.querySelectorAll("#review-forecast .review-forecast__total")) {
                counter.innerHTML = parseInt(counter.innerHTML) - 1;
            }
            return new Response(doc.documentElement.outerHTML, {
                status: response.status,
                headers: response.headers
            });
        } else {
            return originalFetch(...args);
        }
    };

    // Catch document load to edit review count on dashboard
    document.addEventListener("DOMContentLoaded", () => {
        let reviewNumberElement = document.querySelector(".reviews-dashboard .reviews-dashboard__count-text span");
        reviewNumberElement.innerHTML = parseInt(reviewNumberElement.innerHTML) + activePackProfile.getNumActiveReviews() + (CustomSRSSettings.savedData.capturedWKReview ? -1 : 0);
        Utils.log("Captured review item: " + (CustomSRSSettings.savedData.capturedWKReview ? CustomSRSSettings.savedData.capturedWKReview.id : "none"));

        let reviewTile = document.querySelector("div.reviews-dashboard");
        if(reviewTile.querySelector(".reviews-dashboard__buttons") === null && activePackProfile.getNumActiveReviews() > 0) { // If failed to catch WK review and custom items are due, display error message
            reviewTile.querySelector(".reviews-dashboard__text .wk-text").innerHTML = "CustomSRS Error. Please wait for WK review item to be available.";
        } else if(parseInt(reviewTile.querySelector(".count-bubble").innerHTML) === 0) { // If no custom items are due, update review tile to remove buttons
            reviewTile.querySelector(".reviews-dashboard__buttons").remove();
            reviewTile.classList.add("reviews-dashboard--complete");
            reviewTile.querySelector(".reviews-dashboard__text .wk-text").innerHTML = "There are no more reviews to do right now.";
        }
    });

    await SyncManager.checkIfAuthed();

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

// ----------- WKOF HANDLER -----------
/*if(wkof) {
    const wkofHandler = (config, options) => {
        console.log(config, options);
        return new Promise((resolve, reject) => {
            reject("Not implemented yet.");
        });
    }
    wkof.ItemData.registry.sources["wk_custom_srs"] = {
       description: "WK Custom SRS",
       fetcher: wkofHandler
    }
}*/

// ----------- UTILITIES -----------
function parseHTML(html) {
    var t = document.createElement('template');
    t.innerHTML = html;
    return t.content;
}

function updateLessonReviewCountData(data) {
    if(data === null) Utils.log("Error: updateLessonReviewCountData data is null.");
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
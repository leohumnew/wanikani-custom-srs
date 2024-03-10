let activePackProfile = await StorageManager.loadPackProfile("main");
let quizStatsController;

// ----------- If on review page -----------
if (window.location.pathname.includes("/review")) {
    if(activePackProfile.getNumActiveReviews() === 0) return;

    // Add style to root to prevent header flash
    let style = document.createElement("style");
    style.innerHTML = `
    .character-header__characters {
        opacity: 0;
        transition: opacity 0.25s;
    }
    .character-header__loaded .character-header__characters {
        opacity: 1;
    }
    `;
    document.head.appendChild(style);

    // Create observer objects to modify quiz queue and character header
    let tempNode;
    let scriptElementObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.tagName === "SCRIPT") {
                        let newQuizQueueSRS = activePackProfile.getActiveReviewsSRS().join();
                        node.innerHTML = "[" + newQuizQueueSRS + "," + node.innerHTML.slice(1);
                        scriptElementObserver.disconnect();
                    }
                });
            }
        });
    });
    let observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.classList && node.classList.contains("character-header")) {
                        tempNode = node;
                    }
                    else if (node.id === "quiz-queue") {
                        node.childNodes.forEach(function(childNode) {
                            if(childNode.tagName==="SCRIPT") {
                                quizQueue = activePackProfile.getActiveReviews();
                                childNode.innerHTML = JSON.stringify(quizQueue).slice(0, -1) + "," + childNode.innerHTML.slice(1);
                                scriptElementObserver.observe(node, {
                                    childList: true,
                                    subtree: true
                                });
                                observer.disconnect();
                                for(className of tempNode.classList) {
                                    if(className.includes("character-header--")) {
                                        tempNode.classList.remove(className);
                                        tempNode.classList.add("character-header--" + activePackProfile.getActiveReviews()[0].type.toLowerCase());
                                        // Add loaded class to character-header after 250ms
                                        setTimeout(() => {
                                            tempNode.classList.add("character-header__loaded");
                                        }, 700);
                                        break;
                                    }
                                }
                            }
                        });
                    }
                });
            }
        });
    });
    observer.observe(document, { childList: true, subtree: true });

    // Add custom items to the quiz queue
    document.addEventListener("DOMContentLoaded", () => {
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
                reviewCountElement.innerHTML = parseInt(reviewCountElement.innerHTML) + activePackProfile.getNumActiveReviews();
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
        reviewNumberElement.innerHTML = parseInt(reviewNumberElement.innerHTML) + activePackProfile.getNumActiveReviews();
        // Enable review button if 0 WaniKani reviews
        let reviewTile = document.querySelector("div.reviews-dashboard");
        if(reviewTile.querySelector(".reviews-dashboard__buttons") === null && activePackProfile.getNumActiveReviews() > 0) {
            let buttonHTML = `
            <div class="reviews-dashboard__buttons">
                <div class="reviews-dashboard__button reviews-dashboard__button--start">
                    <a href="/subjects/review" class="wk-button wk-button--modal-primary" data-turbo="false">
                        <span class="wk-button__text">Start Reviews</span>
                        <span class="wk-button__icon wk-button__icon--after"><i class="wk-icon fa-solid fa-chevron-right" aria-hidden="true"></i></span>
                    </a>
                </div>
            </div>`;
            reviewTile.innerHTML += buttonHTML;
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
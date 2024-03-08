let activePackProfile = await StorageManager.loadPackProfile("main");

// ----------- If on review page -----------
if (window.location.pathname.includes("/review")) {
    // Add custom items to the quiz queue
    document.addEventListener("DOMContentLoaded", () => {
        let queueEl = document.getElementById('quiz-queue');
        let parentEl = queueEl.parentElement;
        queueEl.remove();
        let cloneEl = queueEl.cloneNode(true);

        let newQuizQueueSRS = activePackProfile.getActiveReviewsSRS().join();
        cloneEl.querySelector("script[data-quiz-queue-target='subjectIdsWithSRS']").innerHTML = cloneEl.querySelector("script[data-quiz-queue-target='subjectIdsWithSRS']").innerHTML.replace("[", "[" + newQuizQueueSRS + ",");
        let quizQueue = JSON.parse(cloneEl.querySelector("script[data-quiz-queue-target='subjects']").innerHTML);
        quizQueue = activePackProfile.getActiveReviews().concat(quizQueue);
        cloneEl.querySelector("script[data-quiz-queue-target='subjects']").innerHTML = JSON.stringify(quizQueue);

        parentEl.appendChild(cloneEl);
    });

    // Catch submission fetch and stop it if submitted item is a custom item
    const { fetch: originalFetch } = unsafeWindow;
    unsafeWindow.fetch = async (...args) => {
        let [resource, config] = args;
        if (resource.includes("/subjects/review") && config != null && config.method === "post") {
            let payload = JSON.parse(config.body);
            // Check if submitted item is a custom item
            if(payload.counts && payload.counts[0].id < 0) {
                // Update custom item SRS
                activePackProfile.submitReview(payload.counts[0].id, payload.counts[0].meaning, payload.counts[0].reading);
                return new Response("{}", { status: 200 });
            } else {
                return originalFetch(...args);
            }
        // Catch subject info fetch and return custom item details
        } else if (resource.includes("/subject_info/") && config && config.method === "get") {
            // Submit original fetch but to different URL to get usable headers
            args[0] = "https://www.wanikani.com/subject_info/1";
            let response = await originalFetch(...args);
            let subjectId = resource.split("/").pop();
            let subjectInfo = activePackProfile.getSubjectInfo(subjectId);
            console.log(subjectInfo);
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
            reviewCountElement.innerHTML = parseInt(reviewCountElement.innerHTML) + activePackProfile.getNumActiveReviews();

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
    });
}

// ----------- UTILITIES -----------
function parseHTML(html) {
    var t = document.createElement('template');
    t.innerHTML = html;
    return t.content;
}
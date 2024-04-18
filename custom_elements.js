const srsNames = ["Lesson", "Apprentice 1", "Apprentice 2", "Apprentice 3", "Apprentice 4", "Guru 1", "Guru 2", "Master", "Enlightened", "Burned"];
const time = 106;

if(window.location.pathname.includes("/dashboard") || window.location.pathname === "/") {
    let tempVar = {}; // Temporary variable for multiple things

    // ------------------------ Define and create custom HTML structures ------------------------

    // --------- Main popup ---------
    let overviewPopup = document.createElement("dialog");
    overviewPopup.id = "overview-popup";

    let overviewPopupStyle = document.createElement("style");
    // Styles copied in from styles.css
    overviewPopupStyle.innerHTML = /*css*/ `
    /* General styling */
    .content-box {
        background-color: var(--color-wk-panel-background);
        border-radius: 3px;
        padding: 1rem;
    }

    .dashboard .lessons-and-reviews__section:nth-child(3) {
        margin-top: 12px;
        margin-right: 16px;
    }
    .dashboard .lessons-and-reviews__section:last-child {
        margin-top: 12px }

    /* Main popup styling */
    #overview-popup {
        background-color: var(--color-menu, white);
        width: 60%;
        max-width: 50rem;
        height: 70%;
        max-height: 45rem;
        border: none;
        border-radius: 3px;
        box-shadow: 0 0 1rem rgb(0 0 0 / .5);

        &:focus-visible {
            border: none }
        p {
            margin: 0 }
        input, select {
            margin-bottom: 0.5rem }
        button {
            cursor: pointer;
            background-color: transparent;
            border: none;

            &[type="submit"], &.outline-button {
                border: 1px solid var(--color-text);
                border-radius: 5px;
                padding: 0.2rem 0.8rem;
            }
        }
        button:hover {
            color: var(--color-tertiary, #a5a5a5);

            &[type="submit"], &.outline-button {
                border-color: var(--color-tertiary, #a5a5a5) }
        }
        > header {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px solid var(--color-tertiary, --color-text);
            margin-bottom: 1rem;

            > h1 {
                font-size: x-large;
                color: var(--color-tertiary, --color-text);
            }
            > button {
                border: none;
                color: var(--color-tertiary, --color-text);
                font-size: x-large;

                &:hover {
                    color: var(--color-text) }
                &:focus-visible {
                    outline: none }
            }
        }
        &::backdrop {
            background-color: rgba(0, 0, 0, 0.5) }
    }

    /* Styling for top tabs */
    #tabs {
        display: flex;
        flex-wrap: wrap;

        > input {
            display: none }
        > label {
            cursor: pointer;
            padding: 0.5rem 1rem;
            max-width: 20%;
        }
        > div {
            display: none;
            padding: 1rem;
            order: 1;
            width: 100%;
        }
        > input:checked + label {
            color: var(--color-tertiary, --color-text);
            border-bottom: 2px solid var(--color-tertiary, gray);
        }
        > input:checked + label + div {
            display: initial }
        .pack {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1rem;
    
            span {
                font-style: italic }
            > div {
                margin: auto 0 }
            button {
                margin-left: 10px }
            > div > span, & > div > input {
                margin: 0;
                vertical-align: middle;
            }
        }
    }

    /* Styling for the overview tab */
    #tab-1__content > div {
        display: grid;
        grid-template-columns: 1fr 1fr;
        column-gap: 1.5rem;
        text-align: center;

        p {
            text-align: left }
        #custom-srs-progress .content-box {
            background-color: var(--color-menu, white);
            margin-bottom: 0.6rem;
            h3 {
                margin-top: 0 }
            .progress-bar {
                display: flex;
                justify-content: start;
                height: 0.5rem;
                border-radius: 0.3rem;
                margin-bottom: 0.6rem;
                background-color: var(--color-wk-panel-background, lightgray);
                div {
                    border-radius: 0.3rem }
                div:nth-child(1) {
                    background-color: var(--color-guru, #2ecc71) }
                div:nth-child(2) {
                    background-color: color-mix(in srgb, var(--color-apprentice, #3daee9) 80%, lightgray);
                }
                div:nth-child(3) {
                    background-color: var(--color-apprentice, #3daee9)
                }
                div:nth-child(4) {
                    background-color: color-mix(in srgb, var(--color-apprentice, #3daee9) 80%, black);
                }
                div:nth-child(5) {
                    background-color: color-mix(in srgb, var(--color-apprentice, #3daee9) 60%, black);
                }
            }
        }
    }

    /* Styling for the pack edit tab */
    #tab-3__content > .content-box {
        margin: 1rem 0;

        input, ul {
            margin-left: 0 }
        > div {
            margin-top: 1.5rem }
        div {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
        }
        li {
            margin: 0.25rem;
            justify-content: space-between;
            display: flex;

            & button {
                margin-left: 10px }
        }
        li:hover {
            color: var(--color-tertiary, rgb(165, 165, 165));
        }
    }
    #tab-3__content {
        &:has(#pack-select [value="new"]:checked) .content-box :is(div, ul) {
            display: none }
        &:has(#pack-select [value="import"]:checked) .pack-box {
            display: none }
        &:has(#pack-select [value="import"]:checked) .import-box {
            display: grid !important }
        &:has(#pack-lvl-type [value="internal"]:checked) .pack-lvl-specific {
            display: grid !important }
        &:has(#pack-lvl-type [value="wk"]:checked) .wk-lvl-warn {
            display: grid !important }
    }

    #pack-items {
        background-color: var(--color-menu, white) }

    /* Styling for the item edit tab */
    #tab-4__content {
        hr {
            margin: 0;
            border-color: var(--color-wk-panel-background, gray)
        }
        i {
            opacity: 0.5 }
        .ctx-sentence-div {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
            input {
                margin-right: 0.5rem }
        }
        .item-info-edit-container {
            padding: 1rem;
            border-radius: 3px;
            background-color: var(--color-wk-panel-content-background, white);
            button {
                margin-left: auto }
            label {
                margin-right: 0.5rem }
        }
        .component-div {
            display: grid;
            grid-template-columns: 1fr 0.2fr;
        }

        &:has(#item-type [value="Radical"]:checked) .item-radical-specific {
            display: grid !important }
        &:has(#item-type [value="Kanji"]:checked) .item-kanji-specific {
            display: grid !important }
        &:has(#item-type [value="Vocabulary"]:checked) .item-vocab-specific {
            display: grid !important }
        &:has(#item-type [value="KanaVocabulary"]:checked) .item-kanavocab-specific {
            display: grid !important }

        &:has(#component-type [value="internal"]:checked), &:has(#component-type [value="wk"]:checked) {
            #component-type-container {
                display: none !important }
            #component-id-container {
                display: block !important }
        }
    }
    #tab-4__content .content-box, #tab-4__content .content-box > div, #tab-3__content > .content-box, #tab-3__content > .content-box > div, #tab-5__content .content-box {
        display: grid;
        gap: 0.5rem;
        grid-template-columns: 1fr 1fr;
        align-items: center;

        input, select {
            justify-self: end }
    }

    /* Styling for the settings tab */
    #tab-5__content {
        label {
            margin-right: 1rem;
            float: left;
        }
        .component-div {
            display: grid;
            grid-template-columns: 1fr 0.2fr;
            padding: 1rem;
            border-radius: 3px;
            background-color: var(--color-wk-panel-content-background, white);
        }
    }
    `;

    // Add custom review buttons
    let extraButtons = /*html*/ `
    <div class="lessons-and-reviews__section">
        <div class="reviews-dashboard">
            <div class="reviews-dashboard__content">
                <div class="reviews-dashboard__title" style="color: var(--color-todays-lessons-text)">
                    <div class="reviews-dashboard__title-text">Conjugations</div>
                </div>
                <div class="reviews-dashboard__button reviews-dashboard__button--start">
                    <a href="/subjects/review?conjugations&question_order=reading_first" class="wk-button wk-button--modal-primary">
                        <span class="wk-button__text">Start</span>
                        <span class="wk-button__icon wk-button__icon--after">
                            ${Icons.customIconTxt("chevron-right")}
                        </span>
                    </a>
                </div>
            </div>
        </div>
    </div>
    <div class="lessons-and-reviews__section">
        <div class="reviews-dashboard">
            <div class="reviews-dashboard__content">
                <div class="reviews-dashboard__title" style="color: var(--color-todays-lessons-text)">
                    <div class="reviews-dashboard__title-text">Audio Quiz</div>
                </div>
                <div class="reviews-dashboard__button reviews-dashboard__button--start">
                    <a href="/subjects/extra_study?queue_type=burned_items&question_order=meaning_first&audio" class="wk-button wk-button--modal-primary">
                        <span class="wk-button__text">Start</span>
                        <span class="wk-button__icon wk-button__icon--after">
                            ${Icons.customIconTxt("chevron-right")}
                        </span>
                    </a>
                </div>
            </div>
        </div>
    </div>
    `;

    // Add content to the Custom SRS popup
    overviewPopup.innerHTML = /*html*/ `
        <header>
            <h1>WaniKani Custom SRS</h1>
            <button class="close-button" onclick="document.getElementById('overview-popup').close();">${Icons.customIconTxt("cross")}</button>
        </header>
        <div id="tabs">
            <input type="radio" name="custom-srs-tab" id="tab-1" checked>
            <label for="tab-1">Overview</label>
            <div id="tab-1__content">
                <div>
                    <div class="content-box" id="overview-lessons">
                        <h2>Lessons</h2>
                        <h2>--</h2>
                    </div>
                    <div class="content-box" id="overview-reviews">
                        <h2>Reviews</h2>
                        <h2>--</h2>
                    </div>
                    <div class="content-box" style="grid-column: span 2; margin-top: 1rem">
                        <h2>Custom SRS Progress</h2>
                        <div id="custom-srs-progress"></div>
                    </div>
                </div>
            </div>

            <input type="radio" name="custom-srs-tab" id="tab-2">
            <label for="tab-2">Packs</label>
            <div id="tab-2__content"></div>

            <input type="radio" name="custom-srs-tab" id="tab-3">
            <label for="tab-3">Edit Pack</label>
            <div id="tab-3__content">
                <label for="pack-select">Pack:</label>
                <select id="pack-select"></select><br>
                <form class="content-box pack-box">
                    <label for="pack-name">Name:</label>
                    <input id="pack-name" required type="text">
                    <label for="pack-author">Author: </label>
                    <input id="pack-author" required type="text">
                    <label for="pack-version">Version:</label>
                    <input id="pack-version" required type="number" step="0.1">
                    <label for="pack-lvl-type">Pack Levelling Type:</label>
                    <select id="pack-lvl-type" required>
                        <option value="none">No Levels</option>
                        <option value="internal">Pack Levels</option>
                        <option value="wk">WaniKani Levels</option>
                    </select>
                    <div class="wk-lvl-warn" style="display: none; grid-column: 1 / span 2; margin: 0; color: red">
                        <p style="grid-column: 1 / span 2"><i>Warning: Make sure API key is set in Custom SRS settings.</i></p>
                    </div>
                    <div class="pack-lvl-specific" style="display: none; grid-column: 1 / span 2; margin: 0">
                        <label for="pack-lvl">Pack Level (start at 1 recommended):</label>
                        <input id="pack-lvl" required type="number">
                    </div>
                    <div style="grid-column: 1 / span 2">
                        <p>Items:</p>
                        <button id="new-item-button" title="Add Item" type="button" style="margin-left: auto">${Icons.customIconTxt("plus")}</button>
                    </div>
                    <ul style="grid-column: 1 / span 2" class="content-box" id="pack-items"></ul>
                    <button style="grid-column: 1 / span 2" type="submit">Save</button>
                </form>
                <form class="content-box import-box" style="display: none;">
                    <label for="item-type">Paste Pack JSON here:</label>
                    <textarea id="pack-import" required></textarea>
                    <button style="grid-column: 1 / span 2" type="submit">Import</button>
                </form>
            </div>

            <input type="radio" name="custom-srs-tab" id="tab-4">
            <label for="tab-4">Edit Item</label>
            <div id="tab-4__content">
                <div>Select item from Pack edit tab.</div>
                <form class="content-box" style="display: none;">
                    <label for="item-type">Type:</label>
                    <select id="item-type">
                        <option value="Radical">Radical</option>
                        <option value="Kanji">Kanji</option>
                        <option value="Vocabulary">Vocabulary</option>
                        <option value="KanaVocabulary">Kana Vocabulary</option>
                    </select>
                    <label for="item-srs-stage">SRS Stage:</label>
                    <select id="item-srs-stage">
                        <option value="0">Lesson</option>
                        <option value="1">Apprentice 1</option>
                        <option value="2">Apprentice 2</option>
                        <option value="3">Apprentice 3</option>
                        <option value="4">Apprentice 4</option>
                        <option value="5">Guru 1</option>
                        <option value="6">Guru 2</option>
                        <option value="7">Master</option>
                        <option value="8">Enlightened</option>
                        <option value="9">Burned</option>
                    </select>
                    <label for="item-characters">Characters:</label>
                    <input id="item-characters" required type="text">
                    <label for="item-meanings">Meanings (comma separated):</label>
                    <input id="item-meanings" required type="text">
                    <div class="item-vocab-specific item-kanavocab-specific" style="display: none; grid-column: 1 / span 2">
                        <label for="item-readings">Readings (comma separated):</label>
                        <input id="item-readings" type="text">
                    </div>
                    <div class="item-info-edit-container item-kanji-specific" style="display: none; grid-column: 1 / span 2">
                        <label for="knaji-primary-reading">Primary Reading:</label>
                        <select id="kanji-primary-reading">
                            <option value="onyomi">On'yomi</option>
                            <option value="kunyomi">Kun'yomi</option>
                            <option value="nanori">Nanori</option>
                        </select>
                        <p style="grid-column: 1 / span 2"><i>Please enter at least one of the three readings:</i></p>
                        <label for="kanji-onyomi">On'yomi:</label>
                        <input id="kanji-onyomi" type="text">
                        <label for="kanji-kunyomi">Kun'yomi:</label>
                        <input id="kanji-kunyomi" type="text">
                        <label for="kanji-nanori">Nanori:</label>
                        <input id="kanji-nanori" type="text">
                    </div>
                    <!----------- Optional elements ----------->
                    <h3 style="grid-column: 1 / span 2">Optional</h3>
                    <label for="item-level">Item Unlock Level:</label>
                    <input id="item-level" type="number">
                    <div class="item-vocab-specific item-kanavocab-specific" style="display: none; grid-column: 1 / span 2">
                        <label for="item-word-function">Item Word Functions (e.g. noun, の adjective):</label>
                        <input id="item-word-function" type="text">
                    </div>
                    <div class="item-info-edit-container" style="grid-column: 1 / span 2">
                        <p style="grid-column: 1 / span 2"><i>In explanations you can use tags to highlight &lt;r&gt;radicals&lt;/r&gt;, &lt;k&gt;kanji&lt;/k&gt;, &lt;v&gt;vocabulary&lt;/v&gt;, &lt;me&gt;meanings&lt;/me&gt;, and &lt;re&gt;readings&lt;/re&gt;.</i></p>
                        <label for="item-meaning-explanation">Meaning Explanation:</label>
                        <input id="item-meaning-explanation" type="text">
                        <div class="item-kanji-specific item-vocab-specific" style="display: none; grid-column: 1 / span 2; grid-template-columns: 1fr 1fr">
                            <label for="item-reading-explanation">Reading Explanation:</label>
                            <input id="item-reading-explanation" type="text">
                        </div>
                    </div>
                    <div class="item-info-edit-container item-kanavocab-specific item-vocab-specific" style="display: none; grid-column: 1 / span 2">
                        <p>Context Sentences</p>
                        <button id="ctx-add-btn">${Icons.customIconTxt("plus")}</button>
                        <div id="item-context-sentences-container" style="grid-column: 1 / span 2"></div>
                    </div>
                    <div class="item-info-edit-container item-vocab-specific item-radical-specific item-kanji-specific" style="display: none; grid-column: 1 / span 2">
                        <p style="grid-column: 1 / span 2">
                            <span class="item-radical-specific" style="display: none">Kanji This Radical Is In</span>
                            <span class="item-vocab-specific" style="display: none">Kanji Components</span>
                            <span class="item-kanji-specific" style="display: none">Radical Components</span>
                        </p>
                        <p style="grid-column: 1 / span 2"><i>If custom item, enter the character. If WaniKani item, enter the ID found on the WK item page.</i></p>
                        <span>
                            <span id="component-type-container">
                                <label for="component-type" style="float: left">Type:</label>
                                <select id="component-type">
                                    <option value=""><i>Select type</i></option>
                                    <option value="internal">This Pack</option>
                                    <option value="wk">WaniKani</option>
                                </select>
                            </span>
                            <span id="component-id-container" style="display: none">
                                <label id="component-id-label" for="component-id" style="float: left">
                                    <span class="item-radical-specific item-vocab-specific" style="display: none;">Kanji</span>
                                    <span class="item-kanji-specific" style="display: none;">Radical</span>
                                </label>
                                <input id="component-id" type="text">
                            </span>
                        </span>
                        <button id="component-add-btn">${Icons.customIconTxt("plus")}</button>
                        <p style="display: none; grid-column: 1 / span 2; color: red"><i>Failed to find component.</i></p>
                        <hr style="grid-column: 1 / span 2">
                        <div id="components-container" style="grid-column: 1 / span 2"></div>
                    </div>
                    <div class="item-info-edit-container" style="grid-column: 1 / span 2">
                        <label for="item-meaning-whitelist">Meaning Whitelist:</label>
                        <input id="item-meaning-whitelist" type="text">
                        <label for="item-meaning-blacklist">Meaning Blacklist:</label>
                        <input id="item-meaning-blacklist" type="text">
                        <div class="item-kanji-specific item-vocab-specific" style="display: none; grid-column: 1 / span 2; grid-template-columns: 1fr 1fr">
                            <label for="item-reading-whitelist">Reading Whitelist:</label>
                            <input id="item-reading-whitelist" type="text">
                            <label for="item-reading-blacklist">Reading Blacklist:</label>
                            <input id="item-reading-blacklist" type="text">
                        </div>
                    </div>
                    <button style="grid-column: 1 / span 2" type="submit">Add</button>
                </form>
            </div>

            <input type="radio" name="custom-srs-tab" id="tab-5">
            <label for="tab-5">Settings</label>
            <div id="tab-5__content">
                <div class="content-box">
                    <h2 style="grid-column: span 2">General</h2>
                    <label for="settingsShowDueTime">Show item due times</label>
                    <input type="checkbox" id="settingsShowDueTime" checked>
                    <label for="settingsExportSRSData">Include SRS data in exports</label>
                    <input type="checkbox" id="settingsExportSRSData">
                    <label for="settingsItemQueueMode">Position to insert custom items in reviews</label>
                    <select id="settingsItemQueueMode">
                        <option value="start">Start</option>
                        <option value="weighted-start">Random, weighted towards start</option>
                        <option value="random">Random</option>
                    </select>
                    <label for="settingsEnabledConjGrammar">Enable Conjugations and Audio Quiz</label>
                    <input type="checkbox" id="settingsEnabledConjGrammar" checked>
                    <label for="settingsConjGrammarSessionLength">Conjugation session length (item num.)</label>
                    <input type="number" id="settingsConjGrammarSessionLength" value="10">
                    <label style="grid-column: span 2">Active Conjugations:</label>
                    <div id="settingsActiveConj" style="grid-column: span 2"></div>
                    <h2 style="grid-column: span 2">Network Settings</h2>
                    <label for="settingsWKAPIKey">WaniKani API Key</label>
                    <input type="text" id="settingsWKAPIKey" placeholder="API key">
                    <h2 style="grid-column: span 2">Experimental Settings</h2>
                    <p style="grid-column: span 2"><i>These settings are experimental and may not work as intended. I would recommend backing up any item packs you care about (download and save the pack JSON from the packs tab - enable the "Include SRS data in exports"!) just in case.</i></p>
                    <div class="component-div" style="grid-column: span 2; grid-template-columns: 1fr 0.8fr">
                        <label for="settingsSyncEnabled">Enable Cross-Device Sync</label>
                        <input type="checkbox" id="settingsSyncEnabled">
                        <p id="lastSync">&nbsp;&nbsp;Last sync: <span>Never</span></p>
                        <span style="margin-left: auto">
                            <button id="syncNowPull">Force Pull</button>
                            <button id="syncNowPush">Force Push</button>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;

    // --------- Popup open button ---------
    let overviewPopupButton, buttonLI;

    overviewPopupButton = document.createElement("button");
    overviewPopupButton.classList = "sitemap__section-header";
    overviewPopupButton.style = `
        display: flex;
        align-items: center;
    `;
    let buttonSpan = document.createElement("span");
    buttonSpan.classList = "font-sans";
    buttonSpan.innerText = "WK Custom SRS";
    overviewPopupButton.appendChild(buttonSpan);
    buttonLI = document.createElement("li");
    buttonLI.classList = "sitemap__section";
    buttonLI.appendChild(overviewPopupButton);
    overviewPopupButton.title = "Custom SRS";
    overviewPopupButton.onclick = () => {
        changeTab(1);
        overviewPopup.showModal();
    };

    // --------- Add custom elements to page ---------
    document.addEventListener("DOMContentLoaded", () => {
        document.head.appendChild(overviewPopupStyle);
        if(CustomSRSSettings.userSettings.enabledConjGrammar) document.querySelector(".lessons-and-reviews").innerHTML += extraButtons;
        document.body.appendChild(overviewPopup);
        // Add event listeners for buttons etc.
        for(let i = 1; i <= 5; i++) {
            document.querySelector(`#tab-${i}`).onchange = () => {
                changeTab(i) };
        }
        document.getElementById("pack-select").onchange = () => {
            loadPackEditDetails(document.getElementById("pack-select").value) };
        document.getElementById("new-item-button").onclick = () => {
            changeTab(4, null) };
        // Add popup button to page
        if (window.location.pathname.includes("/dashboard") || window.location.pathname === "/") {
            document.getElementById("sitemap").prepend(buttonLI);
        }
    });


    // ---------- Change tab ----------
    function changeTab(tab, data) {
        document.querySelector(`#tab-${tab}`).checked = true;
        switch(tab) {
            case 1:
                updateOverviewTab();
                break;
            case 2:
                updatePacksTab();
                break;
            case 3:
                updateEditPackTab(data);
                break;
            case 4:
                updateEditItemTab(data);
                break;
            case 5:
                updateSettingsTab();
                break;
        }
    }

    // ---------- Update popup content ----------
    function updateOverviewTab() {
        document.querySelector("#overview-reviews h2:last-child").innerText = activePackProfile.getNumActiveReviews();
        // Fill in the progress section with the current progress for each pack
        let progressDiv = document.getElementById("custom-srs-progress");
        progressDiv.innerHTML = "";
        for(let pack of activePackProfile.customPacks) {
            if(pack.active) progressDiv.innerHTML += packProgressHTML(pack);
        }
    }
    function packProgressHTML(pack) {
        return /*html*/ `
        <div class="content-box">
            <h3>${pack.name} - Author: ${pack.author}</h3>
            ${pack.getProgressHTML()}
        </div>
        `;
    }

    function updatePacksTab() {
        let packsTab = document.getElementById("tab-2__content");
        packsTab.innerHTML = "";
        for(let i = 0; i < activePackProfile.customPacks.length; i++) {
            let pack = activePackProfile.customPacks[i];
            let packElement = document.createElement("div");
            packElement.classList = "pack content-box";
            packElement.innerHTML = /*html*/ `
                <h3>${pack.name}: <span>${pack.items.length} items</span><br><span>${pack.author}</span></h3>
                <div>
                    <span>Active: </span>
                    <input type="checkbox" id="pack-${i}-active" ${pack.active ? "checked" : ""}>
                    <button class="edit-pack" title="Edit Pack">${Icons.customIconTxt("edit")}</button>
                    <button class="export-pack" title="Export Pack">${Icons.customIconTxt("download")}</button>
                    <button class="delete-pack" title="Delete Pack">${Icons.customIconTxt("cross")}</button>
                </div>
            `;
            packElement.querySelector(".edit-pack").onclick = () => { // Pack edit button
                changeTab(3, i);
            };
            packElement.querySelector(".export-pack").onclick = () => { // Pack export button to make JSON and then copy it to the clipboard
                let data = StorageManager.packToJSON(activePackProfile.customPacks[i]);
                navigator.clipboard.writeText(data).then(() => {
                    alert("Pack JSON copied to clipboard");
                });
            };
            packElement.querySelector(".delete-pack").onclick = () => { // Pack delete button
                activePackProfile.removePack(i);
                StorageManager.savePackProfile(activePackProfile, "main", true);
                changeTab(2);
            };
            packElement.querySelector(`#pack-${i}-active`).onchange = () => { // Pack active checkbox
                activePackProfile.customPacks[i].active = !activePackProfile.customPacks[i].active;
                StorageManager.savePackProfile(activePackProfile, "main");
            };
            packsTab.appendChild(packElement);
        }
        // New pack button
        let newPackButton = document.createElement("button");
        newPackButton.classList = "outline-button";
        newPackButton.style = "width: 48%";
        newPackButton.innerHTML = "New Pack";
        newPackButton.onclick = () => {
            changeTab(3, "new");
        };
        let importPackButton = document.createElement("button");
        importPackButton.classList = "outline-button";
        importPackButton.style = "width: 48%; float: right;";
        importPackButton.innerHTML = "Import Pack";
        importPackButton.onclick = () => {
            changeTab(3, "import");
        };
        packsTab.append(newPackButton, importPackButton);
    }

    function updateEditPackTab(editPack) {
        let packSelect = document.getElementById("pack-select");
        packSelect.innerHTML = "<option value='new'>New Pack</option><option value='import'>Import Pack</option>";
        for(let i = 0; i < activePackProfile.customPacks.length; i++) {
            let pack = activePackProfile.customPacks[i];
            packSelect.innerHTML += `<option value="${i}">${pack.name} - ${pack.author}</option>`;
        }
        if(editPack !== undefined) packSelect.value = editPack;
        else packSelect.value = "new";
        packSelect.onchange();
    }

    function updateEditItemTab(editItem) {
        tempVar.components = [];
        if(editItem !== undefined) {
            // Show add item edit tab and make sure inputs are empty
            document.querySelector("#tab-4__content > form").style.display = "grid";
            document.querySelector("#tab-4__content > div").style.display = "none";
            document.getElementById("ctx-add-btn").onclick = (e) => {
                e.preventDefault();
                document.getElementById("item-context-sentences-container").appendChild(buildContextSentenceEditHTML("", ""));
            };
            document.getElementById("component-add-btn").onclick = (e) => { // Handle adding kanji components
                e.preventDefault();
                let type = document.getElementById("component-type").value;
                let id = parseInt(document.getElementById("component-id").value);
                let subjectType = document.getElementById("item-type").value == "Kanji" ? "Radical" : "Kanji";
                if(type === "" || id === "") return;
                // Check if component exists. When type is internal id is the item character to search for
                switch(type) {
                    case "internal": {
                        let itemID = activePackProfile.customPacks[document.getElementById("pack-select").value].getItemID(subjectType, document.getElementById("component-id").value);
                        if(itemID) {
                            let itemFromID = activePackProfile.customPacks[document.getElementById("pack-select").value].getItem(itemID);
                            tempVar.components.push({id: itemID, pack: parseInt(document.getElementById("pack-select").value), type: subjectType, characters: itemFromID.info.characters, meanings: itemFromID.info.meanings, readings: itemFromID.info.readings || itemFromID.info.onyomi?.concat(itemFromID.info.kunyomi).concat(itemFromID.info.nanori) || null});
                            document.getElementById("component-add-btn").nextElementSibling.style.display = "none";
                            document.getElementById("components-container").appendChild(buildComponentEditHTML(tempVar.components[tempVar.components.length - 1]));
                            document.getElementById("component-type").value = "";
                            document.getElementById("component-id").value = "";
                        } else {
                            document.getElementById("component-add-btn").nextElementSibling.style.display = "block";
                        }
                        break;
                    } case "wk": {
                        if(isNaN(id)) {
                            document.getElementById("component-add-btn").nextElementSibling.innerText = "Please enter the ID found on this item's details page."
                            document.getElementById("component-add-btn").nextElementSibling.style.display = "block";
                            return;
                        } else document.getElementById("component-add-btn").nextElementSibling.innerText = "Failed to find component.";
                        // Fetch wk api item to check it's valid
                        Utils.wkAPIRequest("subjects/" + id).then((response) => {
                            if(response) {
                                tempVar.components.push({id: id, pack: -1, type: subjectType, characters: response.data.characters, meanings: response.data.meanings.map(m => m.meaning), readings: response.data.readings?.map(r => r.reading) || response.data.onyomi?.concat(response.data.kunyomi).concat(response.data.nanori) || null});
                                document.getElementById("component-add-btn").nextElementSibling.style.display = "none";
                                document.getElementById("components-container").appendChild(buildComponentEditHTML(tempVar.components[tempVar.components.length - 1]));
                                document.getElementById("component-type").value = "";
                                document.getElementById("component-id").value = "";
                            } else {
                                document.getElementById("component-add-btn").nextElementSibling.style.display = "block";
                            }
                        });
                        break;
                    }
                }
            };
            // Clear old data and set new data
            ["item-reading-explanation", "item-meaning-explanation", "item-characters", "item-meanings", "item-readings", "kanji-onyomi", "kanji-kunyomi", "item-level", "kanji-nanori", "item-word-function", "item-meaning-whitelist", "item-meaning-blacklist", "item-reading-whitelist", "item-reading-blacklist"].forEach(s => {
                document.getElementById(s).value = "";
            });
            document.getElementById("item-context-sentences-container").innerHTML = "";
            document.getElementById("components-container").innerHTML = "";
            tempVar.components = [];

            if(editItem !== null) {
                let editItemInfo = activePackProfile.customPacks[document.getElementById("pack-select").value].getItem(editItem).info;
                document.getElementById("item-srs-stage").value = editItemInfo.srs_lvl;
                document.getElementById("item-type").value = editItemInfo.type;
                document.getElementById("item-characters").value = editItemInfo.characters;
                document.getElementById("item-meanings").value = editItemInfo.meanings.join(", ");
                if(editItemInfo.lvl) document.getElementById("item-level").value = editItemInfo.lvl;
                if(editItemInfo.meaning_expl) document.getElementById("item-meaning-explanation").value = editItemInfo.meaning_expl;
                if(editItemInfo.readings) document.getElementById("item-readings").value = editItemInfo.readings.join(", ");
                if(editItemInfo.primary_reading_type) document.getElementById("kanji-primary-reading").value = editItemInfo.primary_reading_type;
                if(editItemInfo.onyomi) document.getElementById("kanji-onyomi").value = editItemInfo.onyomi.join(", ");
                if(editItemInfo.kunyomi) document.getElementById("kanji-kunyomi").value = editItemInfo.kunyomi.join(", ");
                if(editItemInfo.nanori) document.getElementById("kanji-nanori").value = editItemInfo.nanori.join(", ");
                if(editItemInfo.reading_expl) document.getElementById("item-reading-explanation").value = editItemInfo.reading_expl;
                if(editItemInfo.func) document.getElementById("item-word-function").value = editItemInfo.func;
                if(editItemInfo.meaning_wl) document.getElementById("item-meaning-whitelist").value = editItemInfo.meaning_wl.join(", ");
                if(editItemInfo.meaning_bl) document.getElementById("item-meaning-blacklist").value = editItemInfo.meaning_bl.join(", ");
                if(editItemInfo.reading_wl) document.getElementById("item-reading-whitelist").value = editItemInfo.reading_wl.join(", ");
                if(editItemInfo.reading_bl) document.getElementById("item-reading-blacklist").value = editItemInfo.reading_bl.join(", ");
                if(editItemInfo.ctx_jp) {
                    let ctxContainer = document.getElementById("item-context-sentences-container");
                    ctxContainer.innerHTML = "";
                    editItemInfo.ctx_jp.forEach((s, i) => {
                        ctxContainer.appendChild(buildContextSentenceEditHTML(s, editItemInfo.ctx_en[i]));
                    });
                }
                if(editItemInfo.kanji || editItemInfo.radicals) {
                    tempVar.components = editItemInfo.kanji || editItemInfo.radicals;
                    let container = document.getElementById("components-container");
                    container.innerHTML = "";
                    tempVar.components.forEach(k => {
                        container.appendChild(buildComponentEditHTML(k));
                    });
                } else tempVar.components = [];
                document.querySelector("#tab-4__content button[type='submit']").innerText = "Save";
            } else {
                document.querySelector("#tab-4__content button[type='submit']").innerText = "Add";
                document.querySelector("#item-srs-stage").value = "0";
            }
            // Add event listener to form
            document.querySelector("#tab-4__content form").onsubmit = (e) => {
                e.preventDefault();

                let itemType = document.getElementById("item-type").value;

                let infoStruct = {
                    type: itemType,
                    characters: document.getElementById("item-characters").value,
                    meanings: document.getElementById("item-meanings").value.split(",").map(s => s.trim()),
                    srs_lvl: document.getElementById("item-srs-stage").value
                };
                if(document.getElementById("item-meaning-explanation").value != "") infoStruct.meaning_expl = document.getElementById("item-meaning-explanation").value;
                if(document.getElementById("item-level").value != "") infoStruct.lvl = parseInt(document.getElementById("item-level").value);
                if(document.getElementById("item-meaning-whitelist").value != "") infoStruct.meaning_wl = document.getElementById("item-meaning-whitelist").value.split(",").map(s => s.trim());
                if(document.getElementById("item-meaning-blacklist").value != "") infoStruct.meaning_bl = document.getElementById("item-meaning-blacklist").value.split(",").map(s => s.trim());

                let pack = activePackProfile.customPacks[document.getElementById("pack-select").value];
                let ctxDivs = document.getElementById("item-context-sentences-container").children;

                // Add or edit item
                switch(itemType) {
                    case "Radical":
                        infoStruct.category = infoStruct.type;
                        if(tempVar.components.length > 0) infoStruct.kanji = tempVar.components;
                        break;
                    case "Kanji":
                        infoStruct.category = infoStruct.type;
                        infoStruct.primary_reading_type = document.getElementById("kanji-primary-reading").value;
                        if(document.getElementById("kanji-" + infoStruct.primary_reading_type.toLowerCase()).value == "") {
                            alert("Primary reading must be set");
                            return;
                        }
                        if(document.getElementById("kanji-onyomi").value != "") infoStruct.onyomi = document.getElementById("kanji-onyomi").value.split(",").map(s => s.trim());
                        if(document.getElementById("kanji-kunyomi").value != "") infoStruct.kunyomi = document.getElementById("kanji-kunyomi").value.split(",").map(s => s.trim());
                        if(document.getElementById("kanji-nanori").value != "") infoStruct.nanori = document.getElementById("kanji-nanori").value.split(",").map(s => s.trim());
                        if(document.getElementById("item-reading-explanation").value != "") infoStruct.reading_expl = document.getElementById("item-reading-explanation").value;
                        if(document.getElementById("item-reading-whitelist").value != "") infoStruct.reading_wl = document.getElementById("item-reading-whitelist").value.split(",").map(s => s.trim());
                        if(document.getElementById("item-reading-blacklist").value != "") infoStruct.reading_bl = document.getElementById("item-reading-blacklist").value.split(",").map(s => s.trim());
                        if(tempVar.components.length > 0) infoStruct.radicals = tempVar.components;
                        break;
                    case "Vocabulary":
                        infoStruct.category = infoStruct.type;
                        infoStruct.readings = document.getElementById("item-readings").value.split(",").map(s => s.trim());
                        if(document.getElementById("item-reading-explanation").value != "") infoStruct.reading_expl = document.getElementById("item-reading-explanation").value;
                        if(document.getElementById("item-word-function").value != "") infoStruct.func = document.getElementById("item-word-function").value;
                        if(document.getElementById("item-context-sentences-container").children.length > 0) {
                            infoStruct.ctx_jp = [];
                            infoStruct.ctx_en = [];
                            for(let i = 0; i < ctxDivs.length; i++) {
                                let ctxDiv = ctxDivs[i];
                                infoStruct.ctx_jp.push(ctxDiv.children[0].value);
                                infoStruct.ctx_en.push(ctxDiv.children[1].value);
                            }
                        }
                        if(document.getElementById("item-reading-whitelist").value != "") infoStruct.reading_wl = document.getElementById("item-reading-whitelist").value.split(",").map(s => s.trim());
                        if(document.getElementById("item-reading-blacklist").value != "") infoStruct.reading_bl = document.getElementById("item-reading-blacklist").value.split(",").map(s => s.trim());
                        if(tempVar.components.length > 0) infoStruct.kanji = tempVar.components;
                        break;
                    case "KanaVocabulary":
                        infoStruct.category = "Vocabulary";
                        infoStruct.readings = document.getElementById("item-readings").value.split(",").map(s => s.trim());
                        if(document.getElementById("item-word-function").value != "") infoStruct.func = document.getElementById("item-word-function").value;
                        if(document.getElementById("item-context-sentences-container").children.length > 0) {
                            infoStruct.ctx_jp = [];
                            infoStruct.ctx_en = [];
                            for(let i = 0; i < ctxDivs.length; i++) {
                                let ctxDiv = ctxDivs[i];
                                infoStruct.ctx_jp.push(ctxDiv.children[0].value);
                                infoStruct.ctx_en.push(ctxDiv.children[1].value);
                            }
                        }
                        break;
                    default:
                        console.error("Invalid item type");
                        return;
                }
                if(editItem !== null) pack.editItem(editItem, infoStruct);
                else pack.addItem(infoStruct);

                document.querySelector("#tab-4__content > form").style.display = "none";
                document.querySelector("#tab-4__content > div").style.display = "block";
                loadPackEditDetails(document.getElementById("pack-select").value);
                StorageManager.savePackProfile(activePackProfile, "main");
                changeTab(3, document.getElementById("pack-select").value);
            };
        } else {
            // Hide add item edit tab
            document.querySelector("#tab-4__content > form").style.display = "none";
            document.querySelector("#tab-4__content > div").style.display = "block";
        }
    }

    function updateSettingsTab() {
        const settings = CustomSRSSettings.userSettings;
        const updateSetting = (elementId, property, isCheckbox = false, needsReload = false) => {
            const element = document.getElementById(elementId);
            if(isCheckbox) element.checked = settings[property];
            else element.value = settings[property];
            element.onchange = () => {
                settings[property] = isCheckbox ? element.checked : element.value;
                StorageManager.saveSettings();
                if(elementId == "settingsSyncEnabled") {
                    if(element.checked) SyncManager.checkIfAuthed();
                    else {
                        if(confirm("Are you sure you want to disable sync?")) SyncManager.disableSync();
                        else {
                            element.checked = true;
                            settings[property] = true;
                            StorageManager.saveSettings();
                            return;
                        }
                    }
                }
                if(needsReload) window.location.reload();
            };
        };

        updateSetting("settingsShowDueTime", "showItemDueTime", true);
        updateSetting("settingsItemQueueMode", "itemQueueMode");
        updateSetting("settingsExportSRSData", "exportSRSData", true);
        updateSetting("settingsWKAPIKey", "apiKey", false, true);
        updateSetting("settingsEnabledConjGrammar", "enabledConjGrammar", true, true);
        updateSetting("settingsConjGrammarSessionLength", "conjGrammarSessionLength");
        updateSetting("settingsSyncEnabled", "syncEnabled", true);

        document.getElementById("settingsActiveConj").innerHTML = "";
        document.getElementById("settingsActiveConj").appendChild(Conjugations.getSettingsHTML());

        document.querySelector("#lastSync span").innerText = new Date(CustomSRSSettings.savedData.lastSynced).toLocaleString();
        document.getElementById("syncNowPull").onclick = () => {
            StorageManager.loadPackProfile("main");
        };
        document.getElementById("syncNowPush").onclick = () => {
            StorageManager.savePackProfile(activePackProfile, "main", true, true);
        };
    }

    // ---------- Tabs details ----------
    function loadPackEditDetails(i) {
        let packNameInput = document.getElementById("pack-name");
        let packAuthorInput = document.getElementById("pack-author");
        let packVersionInput = document.getElementById("pack-version");
        let packLvlTypeInput = document.getElementById("pack-lvl-type");
        let packLvlInput = document.getElementById("pack-lvl");
        let packItems = document.getElementById("pack-items");
        let importBox = document.getElementById("pack-import");
        if(i === "new") { // If creating a new pack
            packNameInput.value = "";
            packAuthorInput.value = "";
            packVersionInput.value = 0.1;
            packLvlTypeInput.value = "none";
            packLvlInput.value = 1;
        } else if(i === "import") { // If importing a pack
            importBox.value = "";
        } else { // If editing an existing pack
            let pack = activePackProfile.customPacks[i];
            packNameInput.value = pack.name;
            packAuthorInput.value = pack.author;
            packVersionInput.value = pack.version;
            packLvlTypeInput.value = pack.lvlType;
            packLvlInput.value = pack.lvl;
            packItems.innerHTML = "";
            for(let j = 0; j < pack.items.length; j++) {
                let item = pack.items[j];
                let itemElement = document.createElement("li");
                itemElement.classList = "pack-item";
                itemElement.innerHTML = `
                    ${item.info.characters} - ${item.info.meanings[0]} - ${item.info.type} ${CustomSRSSettings.userSettings.showItemDueTime ? "- Due: " + pack.getItemTimeUntilReview(j) : ""}
                    <div>
                        <button class="edit-item" title="Edit Item" type="button">${Icons.customIconTxt("edit")}</button>
                        <button class="delete-item" title="Delete Item" type="button">${Icons.customIconTxt("cross")}</button>
                    </div>
                `;
                itemElement.querySelector(".edit-item").onclick = () => { // Item edit button
                    savePack();
                    changeTab(4, item.id);
                };
                itemElement.querySelector(".delete-item").onclick = () => { // Item delete button
                    pack.removeItem(j);
                    loadPackEditDetails(i);
                };
                packItems.appendChild(itemElement);
            }
        }
        document.querySelector("#tab-3__content form.pack-box").onsubmit = (e) => { // Pack save button
            e.preventDefault();
            savePack();
            changeTab(2);
        };
        document.querySelector("#tab-3__content form.import-box").onsubmit = (e) => { // Pack import button
            e.preventDefault();
            let pack = JSON.parse(importBox.value);

            let packExistingStatus = activePackProfile.doesPackExist(pack.name, pack.author, pack.version); // Check if pack already exists
            if(packExistingStatus == "exists") {
                alert("Import failed: A pack with the same name, author, and version already exists.");
            } else if(packExistingStatus == "no") {
                activePackProfile.addPack(StorageManager.packFromJSON(pack));
                StorageManager.savePackProfile(activePackProfile, "main", true);
                changeTab(2);
            } else {
                if(confirm("A pack with the same name and author but different version already exists. Do you want to update it?")) {
                    activePackProfile.updatePack(packExistingStatus, pack);
                    StorageManager.savePackProfile(activePackProfile, "main", true);
                    changeTab(2);
                }
            }
        };

        function savePack() {
            if(i === "new") {
                let pack = new CustomItemPack(packNameInput.value, packAuthorInput.value, packVersionInput.value, packLvlTypeInput.value, parseInt(packLvlInput.value));
                activePackProfile.addPack(pack);
                changeTab(3, activePackProfile.customPacks.length - 1);
            } else {
                activePackProfile.customPacks[i].name = packNameInput.value;
                activePackProfile.customPacks[i].author = packAuthorInput.value;
                activePackProfile.customPacks[i].version = packVersionInput.value;
                activePackProfile.customPacks[i].lvlType = packLvlTypeInput.value;
                activePackProfile.customPacks[i].lvl = packLvlInput.value;
            }
            StorageManager.savePackProfile(activePackProfile, "main", true);
        }
    }

    // ---------- Item info procedural edit structures ----------
    function buildComponentEditHTML(item) {
        let template = document.createElement('template');
        template.innerHTML = /*html*/ `
        <div class="component-div">
            <p>${item.pack < 0 ? "WaniKani" : "This Pack"} ${item.type}. Character: ${item.characters} | Meaning: ${item.meanings[0]}</p>
            <button class="delete-component" title="Delete Component">${Icons.customIconTxt("cross")}</button>
        </div>
        `;
        template.content.querySelector(".delete-component").onclick = function() {
            tempVar.components.splice(tempVar.components.findIndex(c => c.id == item.id && c.pack == item.pack), 1);
            this.parentElement.remove();
        };
        return template.content;
    }

    function buildContextSentenceEditHTML(jp, en) {
        let contextSentence = document.createElement('div');
        contextSentence.classList = "ctx-sentence-div";
        contextSentence.innerHTML = /*html*/ `
        <input type="text" value="${jp}" placeholder="Japanese" required>
        <input type="text" value="${en}" placeholder="English" required>
        <button class="delete-sentence" title="Delete Sentence" onclick="this.parentElement.remove()">${Icons.customIconTxt("cross")}</button>
        `;
        return contextSentence;
    }
} else {
    // Add custom CSS
    let customReviewCSS = document.createElement("style");
    customReviewCSS.innerHTML = /* css */ `
    .character-header__characters {
        font-size: 25px !important;
        text-align: center;
        width: 100%;
    }
    .character-header__characters::first-line {
        font-size: 50px }

    @container(min-width: 768px) {
        .character-header__characters {
            font-size: 50px !important }
        .character-header__characters::first-line {
            font-size: 100px }
    }
    `;
    document.head.appendChild(customReviewCSS);
    // ---------- Item details HTML and formatting ----------
    function buildKanjiComponentHTML(item) {
        return /*html*/ `
        <li class="subject-character-grid__item">
            <a class="subject-character subject-character--${item.type.toLowerCase()} subject-character--grid" data-turbo-frame="_blank" ${item.pack < 0 ? 'href="https://www.wanikani.com/' + item.type.toLowerCase() + '/' + item.characters + '"' : ""}>
                <div class="subject-character__content">
                    <span class="subject-character__characters" lang="ja">${item.characters}</span>
                    <div class="subject-character__info">
                        <span class="subject-character__reading">${item.readings ? item.readings[0] : item.primary_reading_type == "onyomi" ? item.onyomi[0] : item.primary_reading_type == "kunyomi" ? item.kunyomi[0] : item.primary_reading_type == "nanori" ? item.nanori[0] : "-"}</span>
                        <span class="subject-character__meaning">${item.meanings[0]}</span>
                    </div>
                </div>
            </a>
        </li>
        `;
    }
    function buildRadicalComponentHTML(item) {
        return /*html*/ `
        <li class="subject-list__item">
            <a class="subject-character subject-character--radical subject-character--small-with-meaning subject-character--expandable" data-turbo-frame="_blank" ${item.pack < 0 ? 'href="https://www.wanikani.com/radicals/' + item.meanings[0].toLowerCase() + '"' : ""}>
                <div class="subject-character__content">
                    <span class="subject-character__characters" lang="ja">${item.characters}</span>
                    <div class="subject-character__info">
                        <span class="subject-character__meaning">${item.meanings[0]}</span>
                    </div>
                </div>
            </a>
        </li>
        `;
    }
    function buildVocabComponentHTML(item) {
        return /*html*/ `
        <li class="subject-character-grid__item">
            <a class="subject-character subject-character--vocabulary subject-character--grid subject-character--unlocked" href="https://www.wanikani.com/vocabulary/${item.ogChar}" data-turbo-frame="_blank" target="_blank">
                <div class="subject-character__content">
                    <span class="subject-character__characters" lang="ja">${item.ogChar}</span>
                    <div class="subject-character__info">
                        <span class="subject-character__reading">${item.ogReading}</span>
                        <span class="subject-character__meaning">${item.meanings[0]}</span>
                    </div>
                </div>
            </a>
        </li>
        `;
    }
    function buildContextSentencesHTML(ctxArrayJP, ctxArrayEN) {
        let out = "";
        for(let i = 0; i < ctxArrayJP.length; i++) {
            out += `
            <div class="subject-section__text subject-section__text--grouped">
                <p lang="ja">${ctxArrayJP[i]}</p>
                <p>${ctxArrayEN[i]}</p>
            </div>
            `;
        }
        return out;
    }
    function explFormat(expl) {
        return expl.replace(/<r>(.*?)<\/r>/g, "<mark title='Radical' class='radical-highlight'>$1</mark>").replace(/<k>(.*?)<\/k>/g, "<mark title='Kanji' class='kanji-highlight'>$1</mark>").replace(/<v>(.*?)<\/v>/g, "<mark title='Vocabulary' class='vocabulary-highlight'>$1</mark>").replace(/<me>(.*?)<\/me>/g, "<mark title='Meaning' class='meaning-highlight'>$1</mark>").replace(/<re>(.*?)<\/re>/g, "<mark title='Reading' class='reading-highlight'>$1</mark>");
    }
    function makeDetailsHTML(item) {
        switch(item.info.type) {
            case "Radical":
            return /*html*/ `
            <turbo-frame class="subject-info" id="subject-info">
                <div class="container">
                    <section class="subject-section subject-section--meaning subject-section--collapsible" data-controller="toggle" data-toggle-context-value="{&quot;auto_expand_question_types&quot;:[&quot;meaning&quot;]}">
                        <a class='wk-nav__anchor' id='information'></a>
                        <h2 class='subject-section__title'>
                            <a class="subject-section__toggle" data-toggle-target="toggle" data-action="toggle#toggle" aria-expanded="false" aria-controls="section-meaning">
                                <span class="subject-section__toggle-icon">${Icons.customIconTxt("chevron-right")}</span>
                                <span class='subject-section__title-text'>Name</span>
                            </a>
                        </h2>
                        <section id="section-meaning" class="subject-section__content" data-toggle-target="content" hidden="hidden">
                            <section class="subject-section__subsection">
                                <div class='subject-section__meanings'>
                                    <h2 class='subject-section__meanings-title'>Primary</h2>
                                    <p class='subject-section__meanings-items'>${item.info.meanings[0]}</p>
                                </div>
                                ${item.info.meanings.length > 1 ? `
                                <div class="subject-section__meanings">
                                    <h2 class="subject-section__meanings-title">Alternatives</h2>
                                    <p class="subject-section__meanings-items">${item.info.meanings.slice(1).join(', ')}</p>
                                </div>` : ''}
                                <!--<div class='subject-section__meanings'>
                                    <h2 class='subject-section__meanings-title'>User Synonyms</h2>
                                    <p class='subject-section__meanings-items'><i>User synonyms are currently disabled for custom items.</i></p>
                                </div>-->
                            </section>
                            <section class="subject-section__subsection">
                                <h3 class='subject-section__subtitle'>Mnemonic</h3>
                                <p class="subject-section__text">${explFormat(item.info.meaning_expl) || "This item does not have a meaning explanation. Good luck!"}</p>
                                <!--<aside class="subject-hint">
                                    <h3 class="subject-hint__title">
                                        <i class="subject-hint__title-icon" aria-hidden="true">${Icons.customIconTxt("circle-info")}</i>
                                        <span class="subject-hint__title-text">Hints</span>
                                    </h3>
                                    <p class="subject-hint__text"></p>
                                </aside>-->
                            </section>
                            <section class="subject-section__subsection">
                                <h3 class='subject-section__subtitle'>Note</h3>
                                <p class="subject-section__text"><i>Notes are currently disabled for custom items.</i></p>
                            </section>
                        </section>
                    </section>

                    <section class="subject-section subject-section--amalgamations subject-section--collapsible" data-controller="toggle" data-toggle-context-value="{&quot;auto_expand_question_types&quot;:[]}">
                        <a class='wk-nav__anchor' id='amalgamations'></a>
                        <h2 class='subject-section__title'>
                            <a class="subject-section__toggle" data-toggle-target="toggle" data-action="toggle#toggle" aria-expanded="false" aria-controls="section-amalgamations">
                                <span class="subject-section__toggle-icon">${Icons.customIconTxt("chevron-right")}</span>
                                <span class='subject-section__title-text'>Found In Kanji</span>
                            </a>
                        </h2>
                        <section id="section-amalgamations" class="subject-section__content" data-toggle-target="content" hidden="hidden">
                            <div class="subject-character-grid">
                                <ol class="subject-character-grid__items">
                                    ${item.info.kanji?.map(k => buildKanjiComponentHTML(k)).join('') || "No found in kanji set."}
                                </ol>
                            </div>
                        </section>
                    </section>
                </div>
            </turbo-frame>
            `;
            case "Kanji":
            return /*html*/ `
            <turbo-frame class="subject-info" id="subject-info">
                <div class="container">
                    <!-- Radical combination -->
                    <section class="subject-section subject-section--components subject-section--collapsible" data-controller="toggle" data-toggle-context-value="{&quot;auto_expand_question_types&quot;:[&quot;meaning&quot;]}">
                        <h2 class="subject-section__title">
                            <a class="subject-section__toggle" data-toggle-target="toggle" data-action="toggle#toggle" aria-expanded="false" aria-controls="section-components" data-controller-connected="true">
                                <span class="subject-section__toggle-icon" aria-hidden="true">${Icons.customIconTxt("chevron-right")}</span>
                                <span class="subject-section__title-text">Radical Combination</span>
                            </a>
                        </h2>
                        <section id="section-components" class="subject-section__content" data-toggle-target="content">
                            <div class="subject-list subject-list--with-separator">
                                <ul class="subject-list__items">
                                    ${item.info.radicals?.map(k => buildRadicalComponentHTML(k)).join('') || "No radical components set."}
                                </ul>
                            </div>
                        </section>
                    </section>
                    <!-- Meaning -->
                    <section class="subject-section subject-section--meaning subject-section--collapsible" data-controller="toggle" data-toggle-context-value="{&quot;auto_expand_question_types&quot;:[&quot;meaning&quot;]}">
                        <a class='wk-nav__anchor' id='meaning'></a>
                        <h2 class='subject-section__title'>
                            <a class="subject-section__toggle" data-toggle-target="toggle" data-action="toggle#toggle" aria-expanded="false" aria-controls="section-meaning">
                                <span class="subject-section__toggle-icon">${Icons.customIconTxt("chevron-right")}</span>
                                <span class='subject-section__title-text'>Meaning</span>
                            </a>
                        </h2>
                        <section id="section-meaning" class="subject-section__content" data-toggle-target="content" hidden="hidden">
                            <section class="subject-section__subsection">
                                <div class='subject-section__meanings'>
                                    <h2 class='subject-section__meanings-title'>Primary</h2>
                                    <p class='subject-section__meanings-items'>${item.info.meanings[0]}</p>
                                </div>
                                ${item.info.meanings.length > 1 ? `
                                <div class="subject-section__meanings">
                                    <h2 class="subject-section__meanings-title">Alternative</h2>
                                    <p class="subject-section__meanings-items">${item.info.meanings.slice(1).join(', ')}</p>
                                </div>` : ''}
                                <!--<div class='subject-section__meanings'>
                                    <h2 class='subject-section__meanings-title'>User Synonyms</h2>
                                    <p class='subject-section__meanings-items'><i>User synonyms are currently disabled for custom items.</i></p>
                                </div>-->
                            </section>
                            <section class="subject-section__subsection">
                                <h3 class='subject-section__subtitle'>Mnemonic</h3>
                                <p class="subject-section__text">${explFormat(item.info.meaning_expl) || "This item does not have a reading explanation. Good luck!"}</p>
                                <!--<aside class="subject-hint">
                                    <h3 class="subject-hint__title">
                                        <i class="subject-hint__title-icon" aria-hidden="true">${Icons.customIconTxt("circle-info")}</i>
                                        <span class="subject-hint__title-text">Hints</span>
                                    </h3>
                                    <p class="subject-hint__text"></p>
                                </aside>-->
                            </section>
                            <section class="subject-section__subsection">
                                <h3 class='subject-section__subtitle'>Note</h3>
                                <p class="subject-section__text"><i>Notes are currently disabled for custom items.</i></p>
                            </section>
                        </section>
                    </section>
                    <!-- Reading -->
                    <section class="subject-section subject-section--reading subject-section--collapsible" data-controller="toggle" data-toggle-context-value="{&quot;auto_expand_question_types&quot;:[&quot;reading&quot;]}">
                        <a class='wk-nav__anchor' id='reading'></a>
                        <h2 class='subject-section__title'>
                            <a class="subject-section__toggle" data-toggle-target="toggle" data-action="toggle#toggle" aria-expanded="false" aria-controls="section-reading">
                                <span class="subject-section__toggle-icon">${Icons.customIconTxt("chevron-right")}</span>
                                <span class='subject-section__title-text'>Reading</span>
                            </a>
                        </h2>
                        <section id="section-reading" class="subject-section__content" data-toggle-target="content" hidden="hidden">
                            <section class="subject-section__subsection">
                                <div class="subject-readings">
                                    <div class="subject-readings__reading ${item.info.primary_reading_type == "onyomi" ? "subject-readings__reading--primary" : ""}">
                                        <h3 class="subject-readings__reading-title">On’yomi</h3>
                                        <p class="subject-readings__reading-items" lang="ja">
                                            ${item.info?.onyomi.length > 0 ? item.info.onyomi.join(', ') : "None"}
                                        </p>
                                    </div>
                                    <div class="subject-readings__reading ${item.info.primary_reading_type == "kunyomi" ? "subject-readings__reading--primary" : ""}">
                                        <h3 class="subject-readings__reading-title">Kun’yomi</h3>
                                        <p class="subject-readings__reading-items" lang="ja">
                                            ${item.info?.kunyomi.length > 0 ? item.info.kunyomi.join(', ') : "None"}
                                        </p>
                                    </div>
                                    <div class="subject-readings__reading ${item.info.primary_reading_type == "nanori" ? "subject-readings__reading--primary" : ""}">
                                        <h3 class="subject-readings__reading-title">Nanori</h3>
                                        <p class="subject-readings__reading-items" lang="ja">
                                            ${item.info?.nanori.length > 0 ? item.info.nanori.join(', ') : "None"}
                                        </p>
                                    </div>
                                </div>
                            </section>
                            <section class="subject-section__subsection">
                                <h3 class='subject-section__subtitle'>Mnemonic</h3>
                                <p class="subject-section__text">${explFormat(item.info.reading_expl) || "This item does not have a reading explanation. Good luck!"}</p>
                                <!--<aside class="subject-hint">
                                    <h3 class="subject-hint__title">
                                        <i class="subject-hint__title-icon" aria-hidden="true">${Icons.customIconTxt("circle-info")}</i>
                                        <span class="subject-hint__title-text">Hints</span>
                                    </h3>
                                    <p class="subject-hint__text"></p>
                                </aside>-->
                            </section>
                            <section class="subject-section__subsection">
                                <h3 class='subject-section__subtitle'>Note</h3>
                                <p class="subject-section__text"><i>Notes are currently disabled for custom items.</i></p>
                            </section>
                        </section>
                    </section>
                    <!-- Found in vocabulary -->
                    <section class="subject-section subject-section--amalgamations subject-section--collapsible" data-controller="toggle" data-toggle-context-value="{&quot;auto_expand_question_types&quot;:[]}">
                        <a class="wk-nav__anchor" id="amalgamations"></a>
                        <h2 class="subject-section__title">
                            <a class="subject-section__toggle" data-toggle-target="toggle" data-action="toggle#toggle" aria-expanded="false" aria-controls="section-amalgamations" data-controller-connected="true">
                                <span class="subject-section__toggle-icon" aria-hidden="true">${Icons.customIconTxt("chevron-right")}</span>
                                <span class="subject-section__title-text">Found In Vocabulary</span>
                            </a>
                        </h2>
                        <section id="section-amalgamations" class="subject-section__content" data-toggle-target="content">
                            <div class="subject-character-grid subject-character-grid--single-column">
                                <ol class="subject-character-grid__items">
                                    <!--<li class="subject-character-grid__item">
                                        <a class="subject-character subject-character--vocabulary subject-character--grid subject-character--burned" title="うち" href="https://www.wanikani.com/vocabulary/%E5%86%85" data-turbo-frame="_blank">
                                            <div class="subject-character__content">
                                                <span class="subject-character__characters" lang="ja">内</span>
                                                <div class="subject-character__info">
                                                    <span class="subject-character__reading">うち</span>
                                                    <span class="subject-character__meaning">Inside</span>
                                                </div>
                                            </div>
                                        </a>
                                    </li>-->
                                </ol>
                            </div>
                        </section>
                    </section>
                </div>
            </turbo-frame>
            `;
            case "Vocabulary":
            return /*html*/ `
            <turbo-frame class="subject-info" id="subject-info">
                <div class="container">
                    <!-- Meaning -->
                    <section class="subject-section subject-section--meaning subject-section--collapsible" data-controller="toggle" data-toggle-context-value="{&quot;auto_expand_question_types&quot;:[&quot;meaning&quot;]}">
                        <a class='wk-nav__anchor' id='meaning'></a>
                        <h2 class='subject-section__title'>
                            <a class="subject-section__toggle" data-toggle-target="toggle" data-action="toggle#toggle" aria-expanded="false" aria-controls="section-meaning">
                                <span class="subject-section__toggle-icon">${Icons.customIconTxt("chevron-right")}</span>
                                <span class='subject-section__title-text'>Meaning</span>
                            </a>
                        </h2>
                        <section id="section-meaning" class="subject-section__content" data-toggle-target="content" hidden="hidden">
                            <section class="subject-section__subsection">
                                <div class='subject-section__meanings'>
                                    <h2 class='subject-section__meanings-title'>Primary</h2>
                                    <p class='subject-section__meanings-items'>${item.info.meanings[0]}</p>
                                </div>
                                ${item.info.meanings.length > 1 ? `
                                <div class="subject-section__meanings">
                                    <h2 class="subject-section__meanings-title">Alternatives</h2>
                                    <p class="subject-section__meanings-items">${item.info.meanings.slice(1).join(', ')}</p>
                                </div>` : ''}
                                <!--<div class='subject-section__meanings'>
                                    <h2 class='subject-section__meanings-title'>User Synonyms</h2>
                                    <p class='subject-section__meanings-items'><i>User synonyms are currently disabled for custom items.</i></p>
                                </div>-->
                                ${item.info.func ? `<div class="subject-section__meanings">
                                    <h2 class="subject-section__meanings-title">Word Type</h2>
                                    <p class="subject-section__meanings-items">${item.info.func}</p>
                                </div>` : ''}
                            </section>
                            <section class="subject-section__subsection">
                                <h3 class='subject-section__subtitle'>Explanation</h3>
                                <p class="subject-section__text">${explFormat(item.info.meaning_expl) || "This item does not have a meaning explanation. Good luck!"}</p>
                                <!--<aside class="subject-hint">
                                    <h3 class="subject-hint__title">
                                        <i class="subject-hint__title-icon" aria-hidden="true">${Icons.customIconTxt("circle-info")}</i>
                                        <span class="subject-hint__title-text">Hints</span>
                                    </h3>
                                    <p class="subject-hint__text"></p>
                                </aside>-->
                            </section>
                            <section class="subject-section__subsection">
                                <h3 class='subject-section__subtitle'>Note</h3>
                                <p class="subject-section__text"><i>Notes are currently disabled for custom items.</i></p>
                            </section>
                        </section>
                    </section>
                    <!-- Reading -->
                    <section class="subject-section subject-section--reading subject-section--collapsible" data-controller="toggle" data-toggle-context-value="{&quot;auto_expand_question_types&quot;:[&quot;reading&quot;]}">
                        <a class='wk-nav__anchor' id='reading'></a>
                        <h2 class='subject-section__title'>
                            <a class="subject-section__toggle" data-toggle-target="toggle" data-action="toggle#toggle" aria-expanded="false" aria-controls="section-reading">
                                <span class="subject-section__toggle-icon">${Icons.customIconTxt("chevron-right")}</span>
                                <span class='subject-section__title-text'>Reading</span>
                            </a>
                        </h2>
                        <section id="section-reading" class="subject-section__content" data-toggle-target="content" hidden="hidden">
                            <section class="subject-section__subsection">
                                <div class="subject-readings-with-audio">
                                    <div class="subject-readings-with-audio__item">
                                        <div class="reading-with-audio">
                                            <div class="reading-with-audio__reading" lang='ja'>${item.info.readings[0]}</div>
                                            <ul class="reading-with-audio__audio-items">
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <section class="subject-section__subsection">
                                <h3 class='subject-section__subtitle'>Explanation</h3>
                                <p class="subject-section__text">${explFormat(item.info.reading_expl) || "This item does not have a reading explanation. Good luck!"}</p>
                                <!--<aside class="subject-hint">
                                    <h3 class="subject-hint__title">
                                        <i class="subject-hint__title-icon" aria-hidden="true">${Icons.customIconTxt("circle-info")}</i>
                                        <span class="subject-hint__title-text">Hints</span>
                                    </h3>
                                    <p class="subject-hint__text"></p>
                                </aside>-->
                            </section>
                            <section class="subject-section__subsection">
                                <h3 class='subject-section__subtitle'>Note</h3>
                                <p class="subject-section__text"><i>Notes are currently disabled for custom items.</i></p>
                            </section>
                        </section>
                    </section>
                    <!-- Context -->
                    <section class="subject-section subject-section--context subject-section--collapsible" data-controller="toggle" data-toggle-context-value="{&quot;auto_expand_question_types&quot;:[&quot;meaning&quot;]}">
                        <a class="wk-nav__anchor" id="context"></a>
                        <h2 class="subject-section__title">
                            <a class="subject-section__toggle" data-toggle-target="toggle" data-action="toggle#toggle" aria-expanded="false" aria-controls="section-context" data-controller-connected="true">
                                <span class="subject-section__toggle-icon" aria-hidden="true">${Icons.customIconTxt("chevron-right")}</span>
                                <span class="subject-section__title-text">Context</span>
                            </a>
                        </h2>
                        <section id="section-context" class="subject-section__content" data-toggle-target="content">
                            <!--<section class="subject-section__subsection">
                                <div class="subject-collocations" data-controller="tabbed-content" data-tabbed-content-next-tab-hotkey-value="s" data-tabbed-content-previous-tab-hotkey-value="w" data-hotkey-registered="true">
                                    <div class="subject-collocations__patterns">
                                        <h3 class="subject-collocations__title subject-collocations__title--patterns">Pattern of Use</h3>
                                        <div class="subject-collocations__pattern-names">
                                            <a class="subject-collocations__pattern-name" data-tabbed-content-target="tab" data-action="tabbed-content#changeTab" aria-controls="collocations-710736400-0" aria-selected="true" role="tab" lang="ja" href="#collocations-710736400-0">農業を〜</a>
                                        </div>
                                    </div>
                                    <div class="subject-collocations__collocations">
                                        <h3 class="subject-collocations__title">Common Word Combinations</h3>
                                        <ul class="subject-collocations__pattern-collocations">
                                            <li class="subject-collocations__pattern-collocation" id="collocations-710736400-0" data-tabbed-content-target="content" role="tabpanel">
                                                <div class="context-sentences">
                                                    <p class="wk-text" lang="ja">農業を行う</p>
                                                    <p class="wk-text">to carry out farming</p>
                                                </div>
                                            </li>      
                                        </ul>
                                    </div>
                                </div>
                            </section>-->
                            <section class="subject-section__subsection">
                                <h3 class="subject-section__subtitle">Context Sentences</h3>
                                ${item.info.ctx_jp ? buildContextSentencesHTML(item.info.ctx_jp, item.info.ctx_en) : "No context sentences set."}
                            </section>
                        </section>
                    </section>
                    <!-- Kanji Composition -->
                    <section class="subject-section subject-section--components subject-section--collapsible" data-controller="toggle" data-toggle-context-value="{&quot;auto_expand_question_types&quot;:[]}">
                        <a class="wk-nav__anchor" id="components"></a>
                        <h2 class="subject-section__title">
                            <a class="subject-section__toggle" data-toggle-target="toggle" data-action="toggle#toggle" aria-expanded="false" aria-controls="section-components" data-controller-connected="true">
                                <span class="subject-section__toggle-icon" aria-hidden="true">${Icons.customIconTxt("chevron-right")}</span>
                                <span class="subject-section__title-text">Kanji Composition</span>
                            </a>
                        </h2>
                        <section id="section-components" class="subject-section__content" data-toggle-target="content">
                            <div class="subject-character-grid">
                                <ol class="subject-character-grid__items">
                                    ${item.info.kanji?.map(k => buildKanjiComponentHTML(k)).join('') || "No kanji components set."}
                                </ol>
                            </div>
                        </section>
                    </section>
                </div>
            </turbo-frame>
            `;
            case "KanaVocabulary":
            return /*html*/ `
            <turbo-frame class="subject-info" id="subject-info">
                <div class="container">
                    <!-- Meaning -->
                    <section class="subject-section subject-section--meaning subject-section--collapsible" data-controller="toggle" data-toggle-context-value="{&quot;auto_expand_question_types&quot;:[&quot;meaning&quot;]}">
                        <a class='wk-nav__anchor' id='meaning'></a>
                        <h2 class='subject-section__title'>
                            <a class="subject-section__toggle" data-toggle-target="toggle" data-action="toggle#toggle" aria-expanded="false" aria-controls="section-meaning">
                                <span class="subject-section__toggle-icon">${Icons.customIconTxt("chevron-right")}</span>
                                <span class='subject-section__title-text'>Meaning</span>
                            </a>
                        </h2>
                        <section id="section-meaning" class="subject-section__content" data-toggle-target="content" hidden="hidden">
                            <section class="subject-section__subsection">
                                <div class='subject-section__meanings'>
                                    <h2 class='subject-section__meanings-title'>Primary</h2>
                                    <p class='subject-section__meanings-items'>${item.info.meanings[0]}</p>
                                </div>
                                ${item.info.meanings.length > 1 ? `
                                <div class="subject-section__meanings">
                                    <h2 class="subject-section__meanings-title">Alternatives</h2>
                                    <p class="subject-section__meanings-items">${item.info.meanings.slice(1).join(', ')}</p>
                                </div>` : ''}
                                <!--<div class='subject-section__meanings'>
                                    <h2 class='subject-section__meanings-title'>User Synonyms</h2>
                                    <p class='subject-section__meanings-items'><i>User synonyms are currently disabled for custom items.</i></p>
                                </div>-->
                                ${item.info.func ? `<div class="subject-section__meanings">
                                    <h2 class="subject-section__meanings-title">Word Type</h2>
                                    <p class="subject-section__meanings-items">${item.info.func}</p>
                                </div>` : ''}
                            </section>
                            <section class="subject-section__subsection">
                                <h3 class='subject-section__subtitle'>Explanation</h3>
                                <p class="subject-section__text">${explFormat(item.info.meaning_expl) || "This item does not have a meaning explanation. Good luck!"}</p>
                                <!--<aside class="subject-hint">
                                    <h3 class="subject-hint__title">
                                        <i class="subject-hint__title-icon" aria-hidden="true">${Icons.customIconTxt("circle-info")}</i>
                                        <span class="subject-hint__title-text">Hints</span>
                                    </h3>
                                    <p class="subject-hint__text"></p>
                                </aside>-->
                            </section>
                            <section class="subject-section__subsection">
                                <h3 class='subject-section__subtitle'>Note</h3>
                                <p class="subject-section__text"><i>Notes are currently disabled for custom items.</i></p>
                            </section>
                        </section>
                    </section>
                    <!-- Pronunciation -->
                    <section class="subject-section subject-section--reading subject-section--collapsible" data-controller="toggle" data-toggle-context-value="{&quot;auto_expand_question_types&quot;:[&quot;reading&quot;]}">
                        <a class='wk-nav__anchor' id='reading'></a>
                        <h2 class='subject-section__title'>
                            <a class="subject-section__toggle" data-toggle-target="toggle" data-action="toggle#toggle" aria-expanded="false" aria-controls="section-reading">
                                <span class="subject-section__toggle-icon">${Icons.customIconTxt("chevron-right")}</span>
                                <span class='subject-section__title-text'>Pronunciation</span>
                            </a>
                        </h2>
                        <section id="section-reading" class="subject-section__content" data-toggle-target="content" hidden="hidden">
                            <section class="subject-section__subsection">
                                <div class="subject-readings-with-audio">
                                    <div class="subject-readings-with-audio__item">
                                        <div class="reading-with-audio">
                                            <div class="reading-with-audio__reading" lang='ja'>${item.info.readings[0]}</div>
                                            <ul class="reading-with-audio__audio-items">
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </section>
                    </section>
                    <!-- Context -->
                    <section class="subject-section subject-section--context subject-section--collapsible" data-controller="toggle" data-toggle-context-value="{&quot;auto_expand_question_types&quot;:[&quot;meaning&quot;]}">
                        <a class="wk-nav__anchor" id="context"></a>
                        <h2 class="subject-section__title">
                            <a class="subject-section__toggle" data-toggle-target="toggle" data-action="toggle#toggle" aria-expanded="false" aria-controls="section-context" data-controller-connected="true">
                                <span class="subject-section__toggle-icon" aria-hidden="true">${Icons.customIconTxt("chevron-right")}</span>
                                <span class="subject-section__title-text">Context</span>
                            </a>
                        </h2>
                        <section id="section-context" class="subject-section__content" data-toggle-target="content">
                            <!--<section class="subject-section__subsection">
                                <div class="subject-collocations" data-controller="tabbed-content" data-tabbed-content-next-tab-hotkey-value="s" data-tabbed-content-previous-tab-hotkey-value="w" data-hotkey-registered="true">
                                    <div class="subject-collocations__patterns">
                                        <h3 class="subject-collocations__title subject-collocations__title--patterns">Pattern of Use</h3>
                                        <div class="subject-collocations__pattern-names">
                                            <a class="subject-collocations__pattern-name" data-tabbed-content-target="tab" data-action="tabbed-content#changeTab" aria-controls="collocations-710736400-0" aria-selected="true" role="tab" lang="ja" href="#collocations-710736400-0">農業を〜</a>
                                        </div>
                                    </div>
                                    <div class="subject-collocations__collocations">
                                        <h3 class="subject-collocations__title">Common Word Combinations</h3>
                                        <ul class="subject-collocations__pattern-collocations">
                                            <li class="subject-collocations__pattern-collocation" id="collocations-710736400-0" data-tabbed-content-target="content" role="tabpanel">
                                                <div class="context-sentences">
                                                    <p class="wk-text" lang="ja">農業を行う</p>
                                                    <p class="wk-text">to carry out farming</p>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </section>-->
                            <section class="subject-section__subsection">
                                <h3 class="subject-section__subtitle">Context Sentences</h3>
                                ${item.info.ctx_jp ? buildContextSentencesHTML(item.info.ctx_jp, item.info.ctx_en) : "No context sentences set."}
                            </section>
                        </section>
                    </section>
                </div>
            </turbo-frame>
            `;
        }
    }
    function makeDetailsHTMLConjugation(item, conjName, conjDesc) {
        return /*html*/ `
        <turbo-frame class="subject-info" id="subject-info">
            <div class="container">
                <section class="subject-section subject-section--reading subject-section--collapsible" data-controller="toggle" data-toggle-context-value="{&quot;auto_expand_question_types&quot;:[&quot;reading&quot;]}">
                    <a class='wk-nav__anchor' id='information'></a>
                    <h2 class='subject-section__title'>
                        <a class="subject-section__toggle" data-toggle-target="toggle" data-action="toggle#toggle" aria-expanded="false" aria-controls="section-meaning">
                            <span class="subject-section__toggle-icon">${Icons.customIconTxt("chevron-right")}</span>
                            <span class='subject-section__title-text'>Conjugation Info</span>
                        </a>
                    </h2>
                    <section id="section-reading" class="subject-section__content" data-toggle-target="content" hidden="hidden">
                        <section class="subject-section__subsection">
                            <div class='subject-section__meanings'>
                                <h2 class='subject-section__meanings-title'>Conjugated</h2>
                                <div class="subject-section__meanings-items" lang='ja'>${item.readings[0].reading}</div>
                            </div>
                            <div class='subject-section__meanings'>
                                <h2 class='subject-section__meanings-title'>Conjugation</h2>
                                <p class='subject-section__meanings-items'>${conjName} form</p>
                            </div>
                            <div class="subject-section__meanings">
                                <h2 class="subject-section__meanings-title">Verb Type</h2>
                                <p class="subject-section__meanings-items">${item.verbType.charAt(0).toUpperCase() + item.verbType.slice(1)}</p>
                            </div>
                        </section>
                        <section class="subject-section__subsection">
                            <h3 class='subject-section__subtitle'>Explanation</h3>
                            <p class="subject-section__text">${conjDesc}</p>
                        </section>
                        <section class="subject-section__subsection">
                            <h3 class='subject-section__subtitle'>Info</h3>
                            <p class="subject-section__text"><i>This is one of many "conjugations" for this verb. Depending on the type of verb, we remove or modify the last kana and then append the ending corresponding to this conjugation.</i></p>
                        </section>
                    </section>
                </section>

                <section class="subject-section subject-section--amalgamations subject-section--collapsible" data-controller="toggle" data-toggle-context-value="{&quot;auto_expand_question_types&quot;:[&quot;reading&quot;]}">
                    <a class='wk-nav__anchor' id='amalgamations'></a>
                    <h2 class='subject-section__title'>
                        <a class="subject-section__toggle" data-toggle-target="toggle" data-action="toggle#toggle" aria-expanded="false" aria-controls="section-amalgamations">
                            <span class="subject-section__toggle-icon">${Icons.customIconTxt("chevron-right")}</span>
                            <span class='subject-section__title-text'>Verb Details</span>
                        </a>
                    </h2>
                    <section id="section-amalgamations" class="subject-section__content" data-toggle-target="content" hidden="hidden">
                        <div class="subject-character-grid subject-character-grid--single-column">
                            <ol class="subject-character-grid__items">
                                ${buildVocabComponentHTML(item)}
                            </ol>
                        </div>
                    </section>
                </section>
            </div>
        </turbo-frame>
        `;
    }
}
const a = "UFRYcVJzRWlKMnQyUkIyRXphMk53YXAxcjlOUw==";
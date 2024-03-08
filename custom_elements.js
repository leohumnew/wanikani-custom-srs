// ------------------------ Define and create custom HTML structures ------------------------
const srsNames = ["Lesson", "Apprentice 1", "Apprentice 2", "Apprentice 3", "Apprentice 4", "Guru 1", "Guru 2", "Master", "Enlightened", "Burned"]

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

/* Main popup styling */
#overview-popup {
    background-color: var(--color-menu, white);
    width: 60%;
    max-width: 50rem;
    height: 50%;
    max-height: 40rem;
    border: none;
    border-radius: 3px;
    box-shadow: 0 0 1rem rgb(0 0 0 / .5);

    &:focus-visible {
        border: none }
    & p {
        margin: 0 }
    & input, & select {
        margin-bottom: 0.5rem }
    & button {
        cursor: pointer;
        background-color: transparent;
        border: none;

        &[type="submit"] {
            border: 1px solid var(--color-text);
            border-radius: 5px;
            padding: 0.2rem 0.8rem;
        }
    }
    & button:hover {
        color: var(--color-tertiary, #a5a5a5);

        &[type="submit"] {
            border-color: var(--color-tertiary, #a5a5a5) }
    }
    & > header {
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid var(--color-tertiary, --color-text);
        margin-bottom: 1rem;

        & > h1 {
            font-size: x-large;
            color: var(--color-tertiary, --color-text);
        }
        & > button {
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

    & > input {
        display: none }
    & > label {
        cursor: pointer;
        padding: 0.5rem 1rem;
        max-width: 20%;
    }
    & > div {
        display: none;
        padding: 1rem;
        order: 1;
        width: 100%;
    }
    & > input:checked + label {
        color: var(--color-tertiary, --color-text);
        border-bottom: 2px solid var(--color-tertiary, gray);
    }
    & > input:checked + label + div {
        display: initial }
}

/* Styling for the overview tab */
#tab-1__content > div {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 1.5rem;
    text-align: center;

    & p {
        font-size: xxx-large }
}

/* Styling for packs in the packs tab */
#tabs .pack {
    display: flex;
    justify-content: space-between;

    & span {
        font-style: italic }
    & > div {
        margin: auto 0 }
    & button {
        margin-left: 10px }
}

/* Styling for the pack edit tab */
#tab-3__content > .content-box {
    margin: 1rem 0;

    & input, & ul {
        margin-left: 0 }
    & > div {
        margin-top: 1.5rem }
    & div {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
    }
    & li {
        margin: 0.25rem;
        justify-content: space-between;
        display: flex;
        
        & button {
            margin-left: 10px }
    }
    & li:hover {
        color: var(--color-tertiary, rgb(165, 165, 165));
    }
}
#tab-3__content:has(#pack-select [value="new"]:checked) .content-box :is(div, ul) {
    display: none }

#pack-items {
    background-color: var(--color-menu, white) }

/* Styling for the item edit tab */
#tab-4__content:has(#item-type [value="Vocabulary"]:checked) #item-vocab-specific, #tab-4__content:has(#item-type [value="Kana-vocabulary"]:checked) #item-vocab-specific {
    display: block !important }
#tab-4__content:has(#item-type [value="Kanji"]:checked) #item-kanji-specific {
    display: block !important }
`;

overviewPopup.innerHTML = `
    <header>
        <h1>WaniKani Custom SRS</h1>
        <button class="close-button fa-regular fa-xmark" onclick="document.getElementById('overview-popup').close();"></button>
    </header>
    <div id="tabs">
        <input type="radio" name="custom-srs-tab" id="tab-1" checked>
        <label for="tab-1">Overview</label>
        <div id="tab-1__content">
            <div>
                <div class="content-box">
                    <h2>Lessons</h2>
                    <p>0</p>
                </div>
                <div class="content-box">
                    <h2>Reviews</h2>
                    <p></p>
                </div>
            </div>
        </div>

        <input type="radio" name="custom-srs-tab" id="tab-2">
        <label for="tab-2">Packs</label>
        <div id="tab-2__content"></div>

        <input type="radio" name="custom-srs-tab" id="tab-3">
        <label for="tab-3">Edit Pack</label>
        <div id="tab-3__content">
            <label for="pack-select">Pack: </label>
            <select id="pack-select"></select><br>
            <form class="content-box">
                <label for="pack-name">Name: </label>
                <input id="pack-name" required type="text"><br>
                <label for="pack-author">Author: </label>
                <input id="pack-author" required type="text"><br>
                <label for="pack-version">Version: </label>
                <input id="pack-version" required type="number" step="0.1"><br>
                <button type="submit">Save</button>
                <div>
                    <p>Items: </p>
                    <button id="new-item-button" class="fa-regular fa-plus" title="Add Item" type="button"></button>
                </div>
                <ul class="content-box" id="pack-items"></ul>
            </form>
        </div>

        <input type="radio" name="custom-srs-tab" id="tab-4">
        <label for="tab-4">Edit Item</label>
        <div id="tab-4__content">
            <div>Select item from Pack edit tab.</div>
            <form class="content-box" style="display: none;">
                <label for="item-type">Type: </label>
                <select id="item-type">
                    <option value="Radical">Radical</option>
                    <option value="Kanji">Kanji</option>
                    <option value="Vocabulary">Vocabulary</option>
                    <option value="Kana-vocabulary">Kana Vocabulary</option>
                </select><br>
                <label for="item-characters">Characters: </label>
                <input id="item-characters" required type="text"><br>
                <label for="item-meanings">Meanings (comma separated): </label>
                <input id="item-meanings" required type="text"><br>
                <div id="item-vocab-specific" style="display: none;">
                    <label for="item-readings">Readings (comma separated): </label>
                    <input id="item-readings" type="text"><br>
                </div>
                <div id="item-kanji-specific" style="display: none;">
                    <label for="knaji-primary-reading">Primary Reading: </label>
                    <select id="kanji-primary-reading">
                        <option value="onyomi">On'yomi</option>
                        <option value="kunyomi">Kun'yomi</option>
                        <option value="nanori">Nanori</option>
                    </select><br>
                    <label for="kanji-onyomi">On'yomi: </label>
                    <input id="kanji-onyomi" type="text"><br>
                    <label for="kanji-kunyomi">Kun'yomi: </label>
                    <input id="kanji-kunyomi" type="text"><br>
                    <label for="kanji-nanori">Nanori: </label>
                    <input id="kanji-nanori" type="text"><br>
                </div>
                <button type="submit">Add</button>
            </form>
        </div>

        <input type="radio" name="custom-srs-tab" id="tab-5">
        <label for="tab-5">Settings</label>
        <div>TODO</div>
    </div>
`;

// --------- Popup open button ---------
let overviewPopupButton, buttonLI;
if (window.location.pathname.includes("/review")) {
    overviewPopupButton = document.createElement("a");
    overviewPopupButton.classList = "chat-button quiz-footer__button";
    overviewPopupButton.innerText = "WK Custom SRS";
    overviewPopupButton.style = `
        padding: 8px 10px;
        color: #999;
    `;
} else if (window.location.pathname.includes("/dashboard") || window.location.pathname === "/") {
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
}
overviewPopupButton.title = "Custom SRS";
overviewPopupButton.onclick = () => {
    changeTab(1);
    overviewPopup.showModal();
};


// --------- Add custom elements to page ---------
document.addEventListener("DOMContentLoaded", () => {
    document.head.appendChild(overviewPopupStyle);
    document.body.appendChild(overviewPopup);
    // Add event listeners for buttons etc.
    for(let i = 1; i <= 5; i++) {
        document.querySelector(`#tab-${i}`).onchange = () => {
            changeTab(i) };
    }
    document.querySelector("#pack-select").onchange = () => {
        loadPackEditDetails(document.querySelector("#pack-select").value) };
    document.querySelector("#new-item-button").onclick = () => {
        changeTab(4, null) };
    // Add popup button to page
    if (window.location.pathname.includes("/review")) {
        document.querySelector(".quiz-footer .quiz-footer__content").prepend(overviewPopupButton);
    } else if (window.location.pathname.includes("/dashboard") || window.location.pathname === "/") {
        document.querySelector("#sitemap").prepend(buttonLI);
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
    }
}

// ---------- Update popup content ----------
function updateOverviewTab() {
    //document.querySelector("#tab-1__content .content-box:first-child p").innerText = activePackProfile.getActiveLessons().length;
    document.querySelector("#tab-1__content .content-box:last-child p").innerText = activePackProfile.getNumActiveReviews();
}

function updatePacksTab() {
    let packsTab = document.querySelector("#tab-2__content");
    packsTab.innerHTML = "";
    for(let i = 0; i < activePackProfile.customPacks.length; i++) {
        let pack = activePackProfile.customPacks[i];
        let packElement = document.createElement("div");
        packElement.classList = "pack content-box";
        packElement.innerHTML = `
            <h3>${pack.name}: <span>${pack.items.length} items</span><br><span>${pack.author}</span></h3>
            <div>
                <button class="edit-pack fa-regular fa-pen-to-square" title="Edit Pack"></button>
                <button class="fa-regular fa-file-export" title="Export Pack"></button>
                <button class="delete-pack fa-regular fa-trash" title="Delete Pack"></button>
            </div>
        `;
        packElement.querySelector(".edit-pack").onclick = () => { // Pack edit button
            changeTab(3, i);
        };
        packElement.querySelector(".delete-pack").onclick = () => { // Pack delete button
            activePackProfile.removePack(i);
            StorageManager.savePackProfile(activePackProfile, "main");
            changeTab(2);
        };
        packsTab.appendChild(packElement);
    }
}

function updateEditPackTab(editPack) {
    let packSelect = document.querySelector("#pack-select");
    packSelect.innerHTML = "<option value='new'>New Pack</option>";
    for(let i = 0; i < activePackProfile.customPacks.length; i++) {
        let pack = activePackProfile.customPacks[i];
        let option = document.createElement("option");
        option.value = i;
        option.innerText = pack.name + " - " + pack.author;
        packSelect.appendChild(option);
    }
    if(editPack !== undefined) packSelect.value = editPack;
    else packSelect.value = "new";
    packSelect.onchange();
}

function updateEditItemTab(editItem) {
    if(editItem !== undefined) {
        // Show add item edit tab and make sure inputs are empty
        document.querySelector("#tab-4__content > form").style.display = "block";
        document.querySelector("#tab-4__content > div").style.display = "none";
        if(editItem !== null) {
            let editItemDetails = activePackProfile.customPacks[document.querySelector("#pack-select").value].getItem(editItem);
            document.querySelector("#item-type").value = editItemDetails.type;
            document.querySelector("#item-characters").value = editItemDetails.characters;
            document.querySelector("#item-meanings").value = editItemDetails.meanings.join(", ");
            if(editItemDetails.readings) document.querySelector("#item-readings").value = editItemDetails.readings.join(", ");
            if(editItemDetails.primary_reading_type) document.querySelector("#kanji-primary-reading").value = editItemDetails.primary_reading_type;
            if(editItemDetails.onyomi) document.querySelector("#kanji-onyomi").value = editItemDetails.onyomi.join(", ");
            if(editItemDetails.kunyomi) document.querySelector("#kanji-kunyomi").value = editItemDetails.kunyomi.join(", ");
            if(editItemDetails.nanori) document.querySelector("#kanji-nanori").value = editItemDetails.nanori.join(", ");
            document.querySelector("#tab-4__content button[type='submit']").innerText = "Update";
        } else {
            document.querySelector("#item-characters").value = "";
            document.querySelector("#item-meanings").value = "";
            document.querySelector("#item-readings").value = "";
            document.querySelector("#kanji-onyomi").value = "";
            document.querySelector("#kanji-kunyomi").value = "";
            document.querySelector("#kanji-nanori").value = "";
            document.querySelector("#tab-4__content button[type='submit']").innerText = "Add";
        }
        // Add event listener to form
        document.querySelector("#tab-4__content form").onsubmit = (e) => {
            e.preventDefault();

            let itemType = document.querySelector("#item-type").value;
            let characters = document.querySelector("#item-characters").value;
            let meanings = document.querySelector("#item-meanings").value.split(",").map(s => s.trim());
            let readings;
            let pack = activePackProfile.customPacks[document.querySelector("#pack-select").value];

            // Add or edit item
            switch(itemType) {
                case "Radical":
                    if(editItem !== null) pack.editRadical(editItem, characters, meanings);
                    else pack.addRadical(characters, meanings);
                    break;
                case "Kanji":
                    let primary_reading_type = document.querySelector("#kanji-primary-reading").value;
                    let onyomi = document.querySelector("#kanji-onyomi").value;
                    onyomi = onyomi.trim() ? onyomi.split(",").map(s => s.trim()) : [];
                    let kunyomi = document.querySelector("#kanji-kunyomi").value;
                    kunyomi = kunyomi.trim() ? kunyomi.split(",").map(s => s.trim()) : [];
                    let nanori = document.querySelector("#kanji-nanori").value;
                    nanori = nanori.trim() ? nanori.split(",").map(s => s.trim()) : [];
                    if(editItem !== null) pack.editKanji(editItem, characters, meanings, primary_reading_type, onyomi, kunyomi, nanori);
                    else pack.addKanji(characters, meanings, primary_reading_type, onyomi, kunyomi, nanori);
                    break;
                case "Vocabulary":
                    readings = document.querySelector("#item-readings").value.split(",").map(s => s.trim());
                    if(editItem !== null) pack.editVocabulary(editItem, characters, meanings, readings);
                    else pack.addVocabulary(characters, meanings, readings);
                    break;
                case "KanaVocabulary":
                    readings = document.querySelector("#item-readings").value.split(",").map(s => s.trim());
                    if(editItem !== null) pack.editKanaVocabulary(editItem, characters, meanings, readings);
                    else pack.addKanaVocabulary(characters, meanings, readings);
                    break;
                default:
                    console.error("Invalid item type");
            }

            document.querySelector("#tab-4__content > form").style.display = "none";
            document.querySelector("#tab-4__content > div").style.display = "block";
            loadPackEditDetails(document.querySelector("#pack-select").value);
            StorageManager.savePackProfile(activePackProfile, "main");
            changeTab(3, document.querySelector("#pack-select").value);
        };
    } else {
        // Hide add item edit tab
        document.querySelector("#tab-4__content > form").style.display = "none";
        document.querySelector("#tab-4__content > div").style.display = "block";
    }
}

// ---------- Tabs details ----------
function loadPackEditDetails(i) {
    let packNameInput = document.querySelector("#pack-name");
    let packAuthorInput = document.querySelector("#pack-author");
    let packVersionInput = document.querySelector("#pack-version");
    let packItems = document.querySelector("#pack-items");
    if(i === "new") { // If creating a new pack
        packNameInput.value = "";
        packAuthorInput.value = "";
        packVersionInput.value = 0.1;
    } else { // If editing an existing pack
        let pack = activePackProfile.customPacks[i];
        packNameInput.value = pack.name;
        packAuthorInput.value = pack.author;
        packVersionInput.value = pack.version;
        packItems.innerHTML = "";
        for(let j = 0; j < pack.items.length; j++) {
            let item = pack.items[j];
            let itemElement = document.createElement("li");
            itemElement.classList = "pack-item";
            itemElement.innerHTML = `
                ${item.characters} - ${item.meanings[0]} - SRS: ${srsNames[item.srs_stage]}
                <div>
                    <button class="edit-item fa-regular fa-pen-to-square" title="Edit Item" type="button"></button>
                    <button class="delete-item fa-regular fa-trash" title="Delete Item" type="button"></button>
                </div>
            `;
            itemElement.querySelector(".edit-item").onclick = () => { // Item edit button
                changeTab(4, j);
            }
            itemElement.querySelector(".delete-item").onclick = () => { // Item delete button
                pack.items.splice(j, 1);
                loadPackEditDetails(i);
            };
            packItems.appendChild(itemElement);
        }
    }
    document.querySelector("#tab-3__content form").onsubmit = (e) => { // Pack save button
        e.preventDefault();

        let packName = packNameInput.value;
        let packAuthor = packAuthorInput.value;
        let packVersion = packVersionInput.value;
        
        if(i === "new") {
            let pack = new CustomItemPack(packName, packAuthor, packVersion);
            activePackProfile.addPack(pack);
            changeTab(3, activePackProfile.customPacks.length - 1);
        } else {
            activePackProfile.customPacks[i].name = packName;
            activePackProfile.customPacks[i].author = packAuthor;
            activePackProfile.customPacks[i].version = packVersion;
        }
        StorageManager.savePackProfile(activePackProfile, "main");
    };
}

// ---------- Item details ----------
function makeDetailsHTML(item) {
    switch(item.type) {
        case "Radical":
        return /*html*/ `
        <turbo-frame class="subject-info" id="subject-info">
            <div class="container">
                <section class="subject-section subject-section--meaning subject-section--collapsible" data-controller="toggle" data-toggle-context-value="{&quot;auto_expand_question_types&quot;:[&quot;meaning&quot;]}">
                    <a class='wk-nav__anchor' id='information'></a>
                    <h2 class='subject-section__title'>
                        <a class="subject-section__toggle" data-toggle-target="toggle" data-action="toggle#toggle" aria-expanded="false" aria-controls="section-meaning">
                            <i class="subject-section__toggle-icon fa-regular fa-chevron-right"></i>
                            <span class='subject-section__title-text'>Name</span>
                        </a>
                    </h2>
                    <section id="section-meaning" class="subject-section__content" data-toggle-target="content" hidden="hidden">
                        <section class="subject-section__subsection">
                            <div class='subject-section__meanings'>
                                <h2 class='subject-section__meanings-title'>Primary</h2>
                                <p class='subject-section__meanings-items'>${item.meanings[0]}</p>
                            </div>
                            ${item.meanings.length > 1 ? `
                            <div class="subject-section__meanings">
                                <h2 class="subject-section__meanings-title">Alternatives</h2>
                                <p class="subject-section__meanings-items">${item.meanings.slice(1).join(', ')}</p>
                            </div>` : ''}
                            <!--<div class='subject-section__meanings'>
                                <h2 class='subject-section__meanings-title'>User Synonyms</h2>
                                <p class='subject-section__meanings-items'><i>User synonyms are currently disabled for custom items.</i></p>
                            </div>-->
                        </section>
                        <section class="subject-section__subsection">
                            <h3 class='subject-section__subtitle'>Mnemonic</h3>
                            <p class="subject-section__text">${item.meaning_explanation}</p>
                            <!--<aside class="subject-hint">
                                <h3 class="subject-hint__title">
                                    <i class="fa-solid fa-circle-question subject-hint__title-icon" aria-hidden="true"></i>
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
                            <i class="subject-section__toggle-icon fa-regular fa-chevron-right"></i>
                            <span class='subject-section__title-text'>Found In Kanji</span>
                        </a>
                    </h2>
                    <section id="section-amalgamations" class="subject-section__content" data-toggle-target="content" hidden="hidden">
                        <div class="subject-character-grid">
                            <ol class="subject-character-grid__items">
                                <!--<li class="subject-character-grid__item">
                                    <a class="subject-character subject-character--kanji subject-character--grid subject-character--burned" title="じょう" href="https://www.wanikani.com/kanji/%E4%B8%8A" data-turbo-frame="_blank">
                                        <div class="subject-character__content">
                                            <span class="subject-character__characters" lang="ja">上</span>
                                            <div class="subject-character__info">
                                                <span class="subject-character__reading">じょう</span>
                                                <span class="subject-character__meaning">Above</span>
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
        case "Kanji":
        return /*html*/ `
        <turbo-frame class="subject-info" id="subject-info">
            <div class="container">
                <!-- Radical combination -->
                <section class="subject-section subject-section--components subject-section--collapsible" data-controller="toggle" data-toggle-context-value="{&quot;auto_expand_question_types&quot;:[&quot;meaning&quot;]}">
                    <h2 class="subject-section__title">
                        <a class="subject-section__toggle" data-toggle-target="toggle" data-action="toggle#toggle" aria-expanded="false" aria-controls="section-components" data-controller-connected="true">
                            <i class="subject-section__toggle-icon fa-regular fa-chevron-right" aria-hidden="true"></i>
                            <span class="subject-section__title-text">Radical Combination</span>
                        </a>
                    </h2>
                    <section id="section-components" class="subject-section__content" data-toggle-target="content">
                        <div class="subject-list subject-list--with-separator">
                            <ul class="subject-list__items">
                                <!--<li class="subject-list__item">
                                    <a class="subject-character subject-character--radical subject-character--small-with-meaning subject-character--burned subject-character--expandable" title="Head" href="https://www.wanikani.com/radicals/head" data-turbo-frame="_blank">
                                        <div class="subject-character__content">
                                            <span class="subject-character__characters" lang="ja">冂</span>
                                            <div class="subject-character__info">
                                                <span class="subject-character__meaning">Head</span>
                                            </div>
                                        </div>
                                    </a>
                                </li>-->
                            </ul>
                        </div>
                    </section>
                </section>
                <!-- Meaning -->
                <section class="subject-section subject-section--meaning subject-section--collapsible" data-controller="toggle" data-toggle-context-value="{&quot;auto_expand_question_types&quot;:[&quot;meaning&quot;]}">
                    <a class='wk-nav__anchor' id='meaning'></a>
                    <h2 class='subject-section__title'>
                        <a class="subject-section__toggle" data-toggle-target="toggle" data-action="toggle#toggle" aria-expanded="false" aria-controls="section-meaning">
                            <i class="subject-section__toggle-icon fa-regular fa-chevron-right"></i>
                            <span class='subject-section__title-text'>Meaning</span>
                        </a>
                    </h2>
                    <section id="section-meaning" class="subject-section__content" data-toggle-target="content" hidden="hidden">
                        <section class="subject-section__subsection">
                            <div class='subject-section__meanings'>
                                <h2 class='subject-section__meanings-title'>Primary</h2>
                                <p class='subject-section__meanings-items'>${item.meanings[0]}</p>
                            </div>
                            ${item.meanings.length > 1 ? `
                            <div class="subject-section__meanings">
                                <h2 class="subject-section__meanings-title">Alternative</h2>
                                <p class="subject-section__meanings-items">${item.meanings.slice(1).join(', ')}</p>
                            </div>` : ''}
                            <!--<div class='subject-section__meanings'>
                                <h2 class='subject-section__meanings-title'>User Synonyms</h2>
                                <p class='subject-section__meanings-items'><i>User synonyms are currently disabled for custom items.</i></p>
                            </div>-->
                        </section>
                        <section class="subject-section__subsection">
                            <h3 class='subject-section__subtitle'>Mnemonic</h3>
                            <p class="subject-section__text">${item.meaning_explanation}</p>
                            <!--<aside class="subject-hint">
                                <h3 class="subject-hint__title">
                                    <i class="fa-solid fa-circle-question subject-hint__title-icon" aria-hidden="true"></i>
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
                            <i class="subject-section__toggle-icon fa-regular fa-chevron-right"></i>
                            <span class='subject-section__title-text'>Reading</span>
                        </a>
                    </h2>
                    <section id="section-reading" class="subject-section__content" data-toggle-target="content" hidden="hidden">
                        <section class="subject-section__subsection">
                            <div class="subject-readings">
                                <div class="subject-readings__reading ${item.primary_reading_type == "onyomi" ? "subject-readings__reading--primary" : ""}">
                                    <h3 class="subject-readings__reading-title">On’yomi</h3>
                                    <p class="subject-readings__reading-items" lang="ja">
                                        ${item.onyomi.length > 0 ? item.onyomi.join(', ') : "None"}
                                    </p>
                                </div>
                                <div class="subject-readings__reading ${item.primary_reading_type == "kunyomi" ? "subject-readings__reading--primary" : ""}">
                                    <h3 class="subject-readings__reading-title">Kun’yomi</h3>
                                    <p class="subject-readings__reading-items" lang="ja">
                                        ${item.kunyomi.length > 0 ? item.kunyomi.join(', ') : "None"}
                                    </p>
                                </div>
                                <div class="subject-readings__reading ${item.primary_reading_type == "nanori" ? "subject-readings__reading--primary" : ""}">
                                    <h3 class="subject-readings__reading-title">Nanori</h3>
                                    <p class="subject-readings__reading-items" lang="ja">
                                        ${item.nanori.length > 0 ? item.nanori.join(', ') : "None"}
                                    </p>
                                </div>
                            </div>
                        </section>
                        <section class="subject-section__subsection">
                            <h3 class='subject-section__subtitle'>Mnemonic</h3>
                            <p class="subject-section__text">${item.reading_explanation}</p>
                            <!--<aside class="subject-hint">
                                <h3 class="subject-hint__title">
                                    <i class="fa-solid fa-circle-question subject-hint__title-icon" aria-hidden="true"></i>
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
                            <i class="subject-section__toggle-icon fa-regular fa-chevron-right" aria-hidden="true"></i>
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
                            <i class="subject-section__toggle-icon fa-regular fa-chevron-right"></i>
                            <span class='subject-section__title-text'>Meaning</span>
                        </a>
                    </h2>
                    <section id="section-meaning" class="subject-section__content" data-toggle-target="content" hidden="hidden">
                        <section class="subject-section__subsection">
                            <div class='subject-section__meanings'>
                                <h2 class='subject-section__meanings-title'>Primary</h2>
                                <p class='subject-section__meanings-items'>${item.meanings[0]}</p>
                            </div>
                            ${item.meanings.length > 1 ? `
                            <div class="subject-section__meanings">
                                <h2 class="subject-section__meanings-title">Alternatives</h2>
                                <p class="subject-section__meanings-items">${item.meanings.slice(1).join(', ')}</p>
                            </div>` : ''}
                            <!--<div class='subject-section__meanings'>
                                <h2 class='subject-section__meanings-title'>User Synonyms</h2>
                                <p class='subject-section__meanings-items'><i>User synonyms are currently disabled for custom items.</i></p>
                            </div>-->
                            <!--<div class="subject-section__meanings">
                                <h2 class="subject-section__meanings-title">Word Type</h2>
                                <p class="subject-section__meanings-items">noun, の adjective</p>
                            </div>-->
                        </section>
                        <section class="subject-section__subsection">
                            <h3 class='subject-section__subtitle'>Explanation</h3>
                            <p class="subject-section__text">${item.meaning_explanation}</p>
                            <!--<aside class="subject-hint">
                                <h3 class="subject-hint__title">
                                    <i class="fa-solid fa-circle-question subject-hint__title-icon" aria-hidden="true"></i>
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
                            <i class="subject-section__toggle-icon fa-regular fa-chevron-right"></i>
                            <span class='subject-section__title-text'>Reading</span>
                        </a>
                    </h2>
                    <section id="section-reading" class="subject-section__content" data-toggle-target="content" hidden="hidden">
                        <section class="subject-section__subsection">
                            <div class="subject-readings-with-audio">
                                <div class="subject-readings-with-audio__item">
                                    <div class="reading-with-audio">
                                        <div class="reading-with-audio__reading" lang='ja'>${item.readings[0]}</div>
                                        <ul class="reading-with-audio__audio-items">
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section class="subject-section__subsection">
                            <h3 class='subject-section__subtitle'>Explanation</h3>
                            <p class="subject-section__text">${item.reading_explanation}</p>
                            <!--<aside class="subject-hint">
                                <h3 class="subject-hint__title">
                                    <i class="fa-solid fa-circle-question subject-hint__title-icon" aria-hidden="true"></i>
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
                            <i class="subject-section__toggle-icon fa-regular fa-chevron-right" aria-hidden="true"></i>
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
                            <!--<div class="subject-section__text subject-section__text--grouped">
                                <p lang="ja">私たちの町では、米の農業をしてる人々が多いです。</p>
                                <p>In our town, there are many people who are farming rice.</p>
                            </div>-->
                        </section>
                    </section>
                </section>
                <!-- Kanji Composition -->
                <section class="subject-section subject-section--components subject-section--collapsible" data-controller="toggle" data-toggle-context-value="{&quot;auto_expand_question_types&quot;:[]}">
                    <a class="wk-nav__anchor" id="components"></a>
                    <h2 class="subject-section__title">
                        <a class="subject-section__toggle" data-toggle-target="toggle" data-action="toggle#toggle" aria-expanded="false" aria-controls="section-components" data-controller-connected="true">
                            <i class="subject-section__toggle-icon fa-regular fa-chevron-right" aria-hidden="true"></i>
                            <span class="subject-section__title-text">Kanji Composition</span>
                        </a>
                    </h2>
                    <section id="section-components" class="subject-section__content" data-toggle-target="content">
                        <div class="subject-character-grid">
                            <ol class="subject-character-grid__items">
                                <!--<li class="subject-character-grid__item">
                                    <a class="subject-character subject-character--kanji subject-character--grid subject-character--burned" title="のう" href="https://www.wanikani.com/kanji/%E8%BE%B2" data-turbo-frame="_blank">
                                        <div class="subject-character__content">
                                            <span class="subject-character__characters" lang="ja">農</span>
                                            <div class="subject-character__info">
                                                <span class="subject-character__reading">のう</span>
                                                <span class="subject-character__meaning">Farming</span>
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
        case "KanaVocabulary":
        return /*html*/ `
        <turbo-frame class="subject-info" id="subject-info">
            <div class="container">
                <!-- Meaning -->
                <section class="subject-section subject-section--meaning subject-section--collapsible" data-controller="toggle" data-toggle-context-value="{&quot;auto_expand_question_types&quot;:[&quot;meaning&quot;]}">
                    <a class='wk-nav__anchor' id='meaning'></a>
                    <h2 class='subject-section__title'>
                        <a class="subject-section__toggle" data-toggle-target="toggle" data-action="toggle#toggle" aria-expanded="false" aria-controls="section-meaning">
                            <i class="subject-section__toggle-icon fa-regular fa-chevron-right"></i>
                            <span class='subject-section__title-text'>Meaning</span>
                        </a>
                    </h2>
                    <section id="section-meaning" class="subject-section__content" data-toggle-target="content" hidden="hidden">
                        <section class="subject-section__subsection">
                            <div class='subject-section__meanings'>
                                <h2 class='subject-section__meanings-title'>Primary</h2>
                                <p class='subject-section__meanings-items'>${item.meanings[0]}</p>
                            </div>
                            ${item.meanings.length > 1 ? `
                            <div class="subject-section__meanings">
                                <h2 class="subject-section__meanings-title">Alternatives</h2>
                                <p class="subject-section__meanings-items">${item.meanings.slice(1).join(', ')}</p>
                            </div>` : ''}
                            <!--<div class='subject-section__meanings'>
                                <h2 class='subject-section__meanings-title'>User Synonyms</h2>
                                <p class='subject-section__meanings-items'><i>User synonyms are currently disabled for custom items.</i></p>
                            </div>-->
                            <!--<div class="subject-section__meanings">
                                <h2 class="subject-section__meanings-title">Word Type</h2>
                                <p class="subject-section__meanings-items">noun, suffix</p>
                            </div>-->
                        </section>
                        <section class="subject-section__subsection">
                            <h3 class='subject-section__subtitle'>Explanation</h3>
                            <p class="subject-section__text">${item.meaning_explanation}</p>
                            <!--<aside class="subject-hint">
                                <h3 class="subject-hint__title">
                                    <i class="fa-solid fa-circle-question subject-hint__title-icon" aria-hidden="true"></i>
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
                            <i class="subject-section__toggle-icon fa-regular fa-chevron-right"></i>
                            <span class='subject-section__title-text'>Pronunciation</span>
                        </a>
                    </h2>
                    <section id="section-reading" class="subject-section__content" data-toggle-target="content" hidden="hidden">
                        <section class="subject-section__subsection">
                            <div class="subject-readings-with-audio">
                                <div class="subject-readings-with-audio__item">
                                    <div class="reading-with-audio">
                                        <div class="reading-with-audio__reading" lang='ja'>${item.readings[0]}</div>
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
                            <i class="subject-section__toggle-icon fa-regular fa-chevron-right" aria-hidden="true"></i>
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
                            <!--<div class="subject-section__text subject-section__text--grouped">
                                <p lang="ja">このパン、５ドルだって。</p>
                                <p>It says this bread costs $5.</p>
                            </div>-->
                        </section>
                    </section>
                </section>
            </div>
        </turbo-frame>
        `;
    }
}
// ------------------------ Define and create custom HTML structures ------------------------
const srsNames = ["Lesson", "Apprentice 1", "Apprentice 2", "Apprentice 3", "Apprentice 4", "Guru 1", "Guru 2", "Master", "Enlightened", "Burned"]

// --------- Main popup ---------
let overviewPopup = document.createElement("dialog");
overviewPopup.id = "overview-popup";

let overviewPopupStyle = document.createElement("style");
// Styles copied in from styles.css
overviewPopupStyle.innerHTML = `
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
    height: 40%;
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
                <label for="item-readings">Readings (comma separated): </label>
                <input id="item-readings" required type="text"><br>
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
            document.querySelector("#item-readings").value = editItemDetails.readings.join(", ");
            document.querySelector("#tab-4__content button[type='submit']").innerText = "Update";
        } else {
            document.querySelector("#item-characters").value = "";
            document.querySelector("#item-meanings").value = "";
            document.querySelector("#item-readings").value = "";
        }
        // Add event listener to form
        document.querySelector("#tab-4__content form").onsubmit = (e) => {
            e.preventDefault();

            let itemType = document.querySelector("#item-type").value;
            let itemCharacters = document.querySelector("#item-characters").value;
            let itemMeanings = document.querySelector("#item-meanings").value.split(",").map(s => s.trim());
            let itemReadings = document.querySelector("#item-readings").value.split(",").map(s => s.trim());

            let pack = activePackProfile.customPacks[document.querySelector("#pack-select").value];

            if(editItem !== null) { // If editing an existing item
                pack.editItem(editItem, itemType, itemType, itemCharacters, itemMeanings, itemReadings);
            } else { // If adding a new item
                pack.addItem(itemType, itemType, itemCharacters, itemMeanings, itemReadings);
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
    let detailsHTML = `
    <turbo-frame class="subject-info" id="subject-info">
        <div class="container">
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
                        <!--<div class='subject-section__meanings'>
                            <h2 class='subject-section__meanings-title'>User Synonyms</h2>
                            <p class='subject-section__meanings-items'><i>User synonyms are currently disabled for custom items.</i></p>
                        </div>-->
                    </section>
                    <section class="subject-section__subsection">
                        <h3 class='subject-section__subtitle'>Mnemonic</h3>
                        <p class="subject-section__text">Lorem Ipsum</p>
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
                        <h3 class='subject-section__subtitle'>Mnemonic</h3>
                        <p class="subject-section__text">Lorem Ipsum</p>
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
        </div>
    </turbo-frame>
    `;
    return detailsHTML;
}
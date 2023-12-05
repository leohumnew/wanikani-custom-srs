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

    & button {
        cursor: pointer;
        background-color: transparent;
    }
    & button:hover {
        color: var(--color-tertiary, #a5a5a5) }
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
        margin-bottom: 1rem }
    & div {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
    }
    & li {
        margin-bottom: 0.5rem;
        justify-content: space-between;
        display: flex;
        
        & button {
            margin-left: 10px }
    }
    & li:hover {
        color: var(--color-tertiary, rgb(165, 165, 165));
    }
}
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
                <input id="pack-name" required><br>
                <label for="pack-author">Author: </label>
                <input id="pack-author" required><br>
                <label for="pack-version">Version: </label>
                <input id="pack-version" required type="number" step="0.1"><br>
                <div>
                    <p>Items: </p>
                    <button onclick="createNewItem()" class="fa-regular fa-plus" title="Add Item"></button>
                </div>
                <ul class="content-box" id="pack-items"></ul>
                <button type="submit">Save</button>
            </form>
        </div>

        <input type="radio" name="custom-srs-tab" id="tab-4">
        <label for="tab-4">Settings</label>
        <div>TODO</div>
    </div>
`;

// --------- Popup open button ---------
let overviewPopupButton = document.createElement("a");
overviewPopupButton.title = "Custom SRS";
overviewPopupButton.classList = "chat-button quiz-footer__button";
overviewPopupButton.innerText = "WK Custom SRS";
overviewPopupButton.onclick = () => {
    updatePopupContent();
    overviewPopup.showModal();
};

overviewPopupButton.style = `
    padding: 8px 10px;
    color: #999;
`;


// --------- Add custom elements to page ---------
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".quiz-footer .quiz-footer__content").prepend(overviewPopupButton);
    document.head.appendChild(overviewPopupStyle);
    document.body.appendChild(overviewPopup);
    // Add event listeners for buttons etc.
    document.querySelector("#pack-select").onchange = () => {
        loadPackEditDetails(document.querySelector("#pack-select").value);
    };
});


// ---------- Update popup content ----------
function updatePopupContent() {
    // Overview tab
    //document.querySelector("#tab-1__content .content-box:first-child p").innerText = activePackProfile.getActiveLessons().length;
    document.querySelector("#tab-1__content .content-box:last-child p").innerText = activePackProfile.getActiveReviews().length;
    // Packs tab
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
            document.querySelector("#tab-3").checked = true;
            document.querySelector("#pack-select").value = i;
            document.querySelector("#pack-select").onchange();
        };
        packElement.querySelector(".delete-pack").onclick = () => { // Pack delete button
            activePackProfile.removePack(i);
            StorageManager.savePackProfile(activePackProfile, "main");
            updatePopupContent();
        };
        packsTab.appendChild(packElement);
    }
    // Edit pack tab
    let packSelect = document.querySelector("#pack-select");
    packSelect.innerHTML = "<option value='new'>New Pack</option>";
    for(let i = 0; i < activePackProfile.customPacks.length; i++) {
        let pack = activePackProfile.customPacks[i];
        let option = document.createElement("option");
        option.value = i;
        option.innerText = pack.name + " - " + pack.author;
        packSelect.appendChild(option);
    }
    packSelect.value = "new";
    packSelect.onchange();
}

// ---------- Load pack edit details ----------
function loadPackEditDetails(i) {
    let packNameInput = document.querySelector("#pack-name");
    let packAuthorInput = document.querySelector("#pack-author");
    let packVersionInput = document.querySelector("#pack-version");
    let packItems = document.querySelector("#pack-items");
    if(i === "new") { // If creating a new pack
        packNameInput.value = "";
        packAuthorInput.value = "";
        packVersionInput.value = 0.1;
        packItems.innerHTML = "";
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
                    <button class="edit-item fa-regular fa-pen-to-square" title="Edit Item"></button>
                    <button class="delete-item fa-regular fa-trash" title="Delete Item"></button>
                </div>
            `;
            itemElement.querySelector(".edit-item").onclick = () => { // Item edit button
                // TODO
            }
            itemElement.querySelector(".delete-item").onclick = () => { // Item delete button
                pack.items.splice(j, 1);
                loadPackEditDetails(i);
            };
            packItems.appendChild(itemElement);
        }
    }
    document.querySelector("#tab-3__content form").onsubmit = () => { // Pack save button
        let packName = packNameInput.value;
        let packAuthor = packAuthorInput.value;
        let packVersion = packVersionInput.value;
        let packItems = document.querySelectorAll("#pack-items .pack-item");
        let pack = new CustomItemPack(packName, packAuthor, packVersion);
        for(let j = 0; j < packItems.length; j++) {
            let item = packItems[j];
            let character = item.children[0].value;
            let meaning = item.children[1].value;
            let reading = item.children[2].value;
            pack.addItem(character, meaning, reading);
        }
        if(i === "new") {
            activePackProfile.addPack(pack);
        } else {
            activePackProfile.customPacks[i] = pack;
        }
        StorageManager.savePackProfile(activePackProfile, "main");
        updatePopupContent();
    };
}

// ---------- Create new item ----------
function createNewItem() {
    
}
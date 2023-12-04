// ------------------------ Define and create custom HTML structures ------------------------

// --------- Main popup ---------

let overviewPopup = document.createElement("dialog");
overviewPopup.id = "overview-popup";

let overviewPopupStyle = document.createElement("style");
// Styles copied in from styles.css
overviewPopupStyle.innerHTML = `
#overview-popup {
    background-color: var(--color-menu, white);
    width: 60%;
    max-width: 50rem;
    height: 40%;
    max-height: 40rem;
    border: none;
    border-radius: 3px;
    box-shadow: 0 0 1rem rgb(0 0 0 / .5);
}
#overview-popup::backdrop {
    background-color: rgba(0, 0, 0, 0.5);
}
#overview-popup > header {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid var(--color-tertiary, --color-text);
    margin-bottom: 1rem;
}
#overview-popup > header > h1 {
    font-size: x-large;
    color: var(--color-tertiary, --color-text);
}
#overview-popup > header > button {
    background-color: transparent;
    border: none;
    color: var(--color-tertiary, --color-text);
    font-size: x-large;
    cursor: pointer;
}
#overview-popup > header > button:hover {
    color: var(--color-text, --color-text);
}
#overview-popup > header > button:focus-visible {
    outline: none;
}

#tabs {
    display: flex;
    flex-wrap: wrap;
}
#tabs > input {
    display: none;
}
#tabs > label {
    cursor: pointer;
    padding: 0.5rem 1rem;
    max-width: 20%;
}
#tabs > div {
    display: none;
    padding: 1rem;
    order: 1;
    width: 100%;
}
#tabs > input:checked + label {
    color: var(--color-tertiary, --color-text);
    border-bottom: 2px solid var(--color-tertiary, gray);
}
#tabs > input:checked + label + div {
    display: initial;
}

#tabs .pack {
    background-color: var(--color-wk-panel-background);
    padding: 1rem;
    border-radius: 3px;
    display: flex;
    justify-content: space-between;
}
#tabs .pack button {
    background-color: transparent;
    cursor: pointer;
}
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
            <p>Lessons: 0</p>
            <p>Reviews: 0</p>
        </div>
        <input type="radio" name="custom-srs-tab" id="tab-2">
        <label for="tab-2">Packs</label>
        <div id="tab-2__content"></div>
        <input type="radio" name="custom-srs-tab" id="tab-3">
        <label for="tab-3">Import/Export</label>
        <div>TODO</div>
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
});
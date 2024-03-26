const srsGaps = [0, 4*60*60*1000, 8*60*60*1000, 23*60*60*1000, 47*60*60*1000, 167*60*60*1000, 335*60*60*1000, 730*60*60*1000, 2920*60*60*1000];

class CustomItem {
    // Root variables
    id;
    last_reviewed_at = 0;

    // Item main info. Should always contain at least: 
    // type (KanaVocabulary, Vocabulary, Kanji, Radical), category (Vocabulary, Kanji, Radical), srs_lvl, characters, meanings, aux_meanings
    // Optional: meaning_expl, lvl
    // Radicals: --
    // Kanji: primary_reading_type, onyomi, kunyomi, nanori || reading_expl
    // Vocabulary: readings, aux_readings || ctx_jp, ctx_en, reading_expl, kanji
    // KanaVocabulary: || crx_jp, ctx_en
    info;

    constructor(id, info) {
        this.id = id;
        this.info = info;
        this.last_reviewed_at = Date.now();
    }

    isReadyForReview(levelingType, level) { // levelingType: none, internal, wk
        if(this.last_reviewed_at < Date.now() - srsGaps[this.info.srs_lvl] && this.info.srs_lvl > -1) { // TODO: Change SRS stage check to > 0 once lessons are implemented
            if(this.info.srs_lvl > 0) return true; // If item is already in SRS, ignore levels
            else if(levelingType == "none") return true;
            else if(levelingType == "internal" && (!this.info.lvl || level >= this.info.lvl)) return true;
            else if(levelingType == "wk" && (!this.info.lvl || CustomSRSSettings.userSettings.lastKnownLevel >= this.info.lvl)) return true;
        }
        return false;
    }
    getTimeUntilReview(levelingType, level) { // In hours, rounded to integer
        if(this.isReadyForReview(levelingType, level)) {
            return "Now";
        } else {
            if((levelingType == "internal" && this.info.lvl && level < this.info.lvl) || (levelingType == "wk" && this.info.lvl && CustomSRSSettings.userSettings.lastKnownLevel < this.info.lvl)) {
                return "Locked";
            } else return Math.round((srsGaps[this.info.srs_lvl] - (Date.now() - this.last_reviewed_at)) / (60*60*1000)) + "h";
        }
    }

    incrementSRS() {
        if(this.info.srs_lvl < 9) this.info.srs_lvl++;
        this.last_reviewed_at = Date.now();
        StorageManager.savePackProfile(activePackProfile, "main");
    }
    decrementSRS() {
        if(this.info.srs_lvl > 1) {
            if(this.info.srs_lvl < 5) this.info.srs_lvl--;
            else this.info.srs_lvl -= 2;
        }
        this.last_reviewed_at = Date.now();
        StorageManager.savePackProfile(activePackProfile, "main");
    }
    getSRS(packID) {
        return [Utils.cantorNumber(packID, this.id), parseInt(this.info.srs_lvl)];
    }

    getQueueItem(packID) {
        let aux_meanings = [], aux_readings = [];
        if(this.info.meaning_wl) aux_meanings = aux_meanings.concat(this.info.meaning_wl.map(m => ({"type": "whitelist", "meaning": m})));
        if(this.info.meaning_bl) aux_meanings = aux_meanings.concat(this.info.meaning_bl.map(m => ({"type": "blacklist", "meaning": m})));
        if(this.info.reading_wl) aux_readings = aux_readings.concat(this.info.reading_wl.map(r => ({"type": "whitelist", "reading": r})));
        if(this.info.reading_bl) aux_readings = aux_readings.concat(this.info.reading_bl.map(r => ({"type": "blacklist", "reading": r})));
        switch(this.info.type) {
            case "Radical":
                return {
                    id: Utils.cantorNumber(packID, this.id),
                    type: this.info.type,
                    subject_category: this.info.category,
                    characters: this.info.characters,
                    meanings: this.info.meanings,
                    auxiliary_meanings: aux_meanings,
                    kanji: this.info.kanji || []
                };
            case "Kanji":
                return {
                    id: Utils.cantorNumber(packID, this.id),
                    type: this.info.type,
                    subject_category: this.info.category,
                    characters: this.info.characters,
                    meanings: this.info.meanings,
                    auxiliary_meanings: aux_meanings,
                    primary_reading_type: this.info.primary_reading_type,
                    onyomi: this.info.onyomi || [],
                    kunyomi: this.info.kunyomi || [],
                    nanori: this.info.nanori || [],
                    auxiliary_readings: aux_readings,
                    radicals: this.info.radicals || [],
                    vocabulary: this.info.vocabulary || []
                };
            case "Vocabulary":
                return {
                    id: Utils.cantorNumber(packID, this.id),
                    type: this.info.type,
                    subject_category: this.info.category,
                    characters: this.info.characters,
                    meanings: this.info.meanings,
                    auxiliary_meanings: aux_meanings,
                    readings: this.info.readings.map(reading => ({"reading": reading, "pronunciations": []})),
                    auxiliary_readings: aux_readings,
                    kanji: this.info.kanji || []
                };
            case "KanaVocabulary":
                return {
                    id: Utils.cantorNumber(packID, this.id),
                    type: this.info.type,
                    subject_category: this.info.category,
                    characters: this.info.characters,
                    meanings: this.info.meanings,
                    auxiliary_meanings: aux_meanings,
                    readings: this.info.readings.map(reading => ({"reading": reading, "pronunciations": []}))
                };
        }
    }

    static fromObject(object) {
        let item;
        if(object.info.kanji && object.info.kanji[0] && !object.info.kanji[0].characters) delete object.info.kanji; // Remove old component format TODO: remove after a few weeks
        if(!object.info) { // If item from before update TODO: remove after a few weeks
            let newInfo = {};
            newInfo.type = object.type;
            newInfo.category = object.subject_category;
            newInfo.srs_lvl = object.srs_stage;
            newInfo.characters = object.characters;
            newInfo.meanings = object.meanings;
            if(object.readings) newInfo.readings = object.readings;
            if(object.meaning_explanation) newInfo.meaning_expl = object.meaning_explanation;
            if(object.reading_explanation && (object.type == "Vocabulary" || object.type == "Kanji")) newInfo.reading_expl = object.reading_explanation;
            if(object.primary_reading_type) newInfo.primary_reading_type = object.primary_reading_type;
            if(object.onyomi) newInfo.onyomi = object.onyomi;
            if(object.kunyomi) newInfo.kunyomi = object.kunyomi;
            if(object.nanori) newInfo.nanori = object.nanori;
            item = new CustomItem(object.id, newInfo);
        }
        else item = new CustomItem(object.id, object.info);

        if(item.info.context_sentences) { // Convert context_sentences to ctx_jp and ctx_en TODO: remove after a few weeks
            for(let i = 0; i < item.info.context_sentences.length; i++) {
                item.info.ctx_jp = [];
                item.info.ctx_en = [];
                if(i % 2 == 0) item.info.ctx_jp.push(item.info.context_sentences[i]);
                else item.info.ctx_en.push(item.info.context_sentences[i]);
            }
            delete item.info.context_sentences;
        }

        item.last_reviewed_at = object.last_reviewed_at;
        return item;
    }
}

class CustomItemPack {
    name;
    author;
    version;
    items = [];
    active = true;
    nextID = 0;
    lvlType = "none"; // "none", "internal", "wk"
    lvl = 1;

    constructor(name, author, version, lvlType, lvl = 1) {
        this.name = name;
        this.author = author;
        this.version = version;
        this.lvlType = lvlType;
        this.lvl = lvl;
    }

    getItem(id) {
        return this.items.find(item => item.id === id);
    }
    getItemID(itemType, itemChar) {
        let item = this.items.find(item => item.info.characters === itemChar && item.info.type === itemType);
        if(item) return item.id;
        else return null;
    }
    addItem(itemInfo) {
        let id = this.nextID++;
        let item = new CustomItem(id, itemInfo);
        this.items.push(item);
    }
    editItem(id, itemInfo) {
        let item = this.getItem(id);
        delete item.info;
        item.info = itemInfo;    
    }

    removeItem(position) {
        this.items.splice(position, 1);
    }

    getActiveReviews(packID) { // Get all items that were last reviewed more than 24 hours ago
        if(!this.active) return [];
        return this.items.filter(item => item.isReadyForReview(this.lvlType, this.lvl)).map(item => item.getQueueItem(packID));
    }
    getActiveReviewsSRS(packID) {
        if(!this.active) return [];
        return this.items.filter(item => item.isReadyForReview(this.lvlType, this.lvl)).map(item => item.getSRS(packID));
    }
    getNumActiveReviews() {
        if(!this.active) return 0;
        let num = 0;
        for(let item of this.items) {
            if(item.isReadyForReview(this.lvlType, this.lvl)) num++;
        }
        return num;
    }
    getItemTimeUntilReview(itemIndex) {
        return this.items[itemIndex].getTimeUntilReview(this.lvlType, this.lvl);
    }

    static fromObject(object) {
        let pack = new CustomItemPack(object.name, object.author, object.version, (object.lvlType ? object.lvlType : "none"), (object.lvl ? object.lvl : 1)); // TODO: Remove lvlType and lvl checks after a few weeks
        pack.items = object.items.map(item => CustomItem.fromObject(item));
        pack.active = object.active;
        pack.nextID = (object.nextID || pack.items.length); // If lastID is not present, use the length of the items array
        return pack;
    }
}

class CustomPackProfile {
    customPacks = [];

    getPack(id) {
        return this.customPacks[id];
    }
    addPack(newPack) {
        this.customPacks.push(newPack);
    }
    removePack(id) {
        this.customPacks.splice(id, 1);
    }

    doesPackExist(packName, packAuthor, packVersion) {
        for(let i = 0; i < this.customPacks.length; i++) {
            let pack = this.customPacks[i];
            if(pack.name === packName && pack.author === packAuthor) {
                if(pack.version === packVersion) return "exists";
                else return i;
            }
        }
        return "no";
    }
    updatePack(id, newPack) { // Update pack but keeping the SRS stages of items that are in both the old and new pack
        let oldPack = this.customPacks[id];
        newPack = StorageManager.packFromJSON(newPack);
        for(let i = 0; i < newPack.items.length; i++) {
            let newItem = newPack.items[i];
            let oldItem = oldPack.items.find(item => item.id === newItem.id);
            if(oldItem) {
                newItem.info.srs_lvl = oldItem.info.srs_lvl;
                newItem.last_reviewed_at = oldItem.last_reviewed_at;
            }
        }
        this.customPacks[id] = newPack;
    }

    getActiveReviews() {
        let activeReviews = [];
        for(let i = 0; i < this.customPacks.length; i++) {
            activeReviews.push(...this.customPacks[i].getActiveReviews(i));
        }
        return activeReviews;
    }
    getNumActiveReviews() {
        return this.customPacks.reduce((acc, pack) => acc + pack.getNumActiveReviews(), 0);
    }
    getActiveReviewsSRS() {
        let activeReviewsSRS = [];
        for(let i = 0; i < this.customPacks.length; i++) {
            activeReviewsSRS.push(...this.customPacks[i].getActiveReviewsSRS(i));
        }
        return activeReviewsSRS;
    }

    getSubjectInfo(cantorNum) { // Get details of custom item for review page details display
        let [packID, itemID] = Utils.reverseCantorNumber(cantorNum);
        let item = this.getPack(packID).getItem(itemID);
        return makeDetailsHTML(item);
    }

    submitReview(cantorNum, meaningIncorrectNum, readingIncorrectNum) {
        let [packID, itemID] = Utils.reverseCantorNumber(cantorNum);
        let item = this.customPacks[packID].getItem(itemID);
        if(meaningIncorrectNum > 0 || readingIncorrectNum > 0) {
            item.decrementSRS();
        } else {
            item.incrementSRS();
            // Check if pack should level up
            let pack = this.customPacks[packID];
            if(pack.lvlType == "internal") {
                for(let item of pack.items) {
                    if((!item.info.lvl || item.info.lvl <= pack.lvl) && item.info.srs_lvl < 5) break;
                }
                pack.lvl++;
            }
        }
    }

    static fromObject(object) {
        let packProfile = new CustomPackProfile();
        packProfile.customPacks = object.customPacks.map(pack => CustomItemPack.fromObject(pack));
        return packProfile;
    }
}

// ------------------- Conjugations -------------------
class Conjugations {
    static rootEnds = [
        ["あ", "か", "さ", "た", "な", "は", "ま", "ら"],
        ["い", "き", "し", "ち", "に", "ひ", "み", "り"],
        ["う", "く", "す", "つ", "ぬ", "ふ", "む", "る", "ぐ"],
        ["え", "け", "せ", "て", "ね", "へ", "め", "れ"],
        ["お", "こ", "そ", "と", "の", "ほ", "も", "ろ"]
        ["って", "いて", "して", "って", "んで", "んで", "んで", "って", "いで"],
        ["った", "いた", "した", "った", "んだ", "んだ", "んだ", "った", "いた"]
    ];
    static conjugations = { // Conjugation name : [godan kana, general ending, explanation]
        "te": [5, "て", "This is the te-form of the verb, used for connecting sentences."],
        "ta": [6, "た", "This is the ta-form of the verb, used for past tense."],
        "masu": [1, "ます", "This is the present/future keigo form of the verb, used in polite speech."],
        "mashita": [1, "ました", "This is the past keigo form of the verb, used in polite speech."],
        "masen": [1, "ません", "This is the negative keigo form of the verb, used in polite speech."],
        "masendeshita": [1, "ませんでした", "This is the negative past keigo form of the verb, used in polite speech."],
        "tai": [1, "たい", "This is the 'want to do' form of the verb."],
        "nai": [0, "ない", "This is the negative form of the verb."]
    };
    static irregularVerbs = {
    };

    static conjugateVerb(verb, type, form) {
        switch(type) {
            case "godan":
                verb = verb.slice(0, -1);
            case "ichidan":
                verb = verb.slice(0, -1);
            case "irregular":
                verb = this.irregularVerbs[verb];
        }
        verb += this.rootEnds[this.conjugations[form][0]];
        verb += this.conjugations[form][1];
    }
    static getConjugationQueueItem(verb, type, form) {
    }
}

// ------------------- Utility classes -------------------
class Utils {
    static cantorNumber(a, b) {
        return -(0.5 * (a + b) * (a + b + 1) + b) - 1;
    }
    static reverseCantorNumber(z) {
        z = -z - 1;
        let w = Math.floor((Math.sqrt(8 * z + 1) - 1) / 2);
        let y = z - ((w * w + w) / 2);
        let x = w - y;
        return [x, y];
    }
    static async get_controller(name) {
        let controller;
        while(!controller) {
            try {
                controller = Stimulus.getControllerForElementAndIdentifier(document.querySelector(`[data-controller~="${name}"]`),name);
            } catch(e) {
                console.log("Waiting for controller " + name);
            }
            await new Promise(r => setTimeout(r, 50));
        }
        return controller;
    }
    static async wkAPIRequest(endpoint, method = "GET", data = null) {
        if(!CustomSRSSettings.userSettings.apiKey) console.error("CustomSRS: No API key set");
        let url = "https://api.wanikani.com/v2/" + endpoint;
        let headers = new Headers({
            Authorization: "Bearer " + CustomSRSSettings.userSettings.apiKey,
        });
        let apiRequest = new Request(url, {
            method: method,
            headers: headers
        });
        if(data) apiRequest.body = JSON.stringify(data);

        let response = await fetch(apiRequest);
        return response.json();
    }
}

class CustomSRSSettings {
    static defaultUserSettings = {
        showItemDueTime: true,
        itemQueueMode: "start",
        exportSRSData: false,
        lastKnownLevel: 0,
        apiKey: null
    };
    static userSettings = this.defaultUserSettings;
    static savedData = {
        capturedWKReview: null
    };
    static validateSettings() {
        for(let setting in this.defaultUserSettings) {
            if(this.userSettings[setting] === undefined) this.userSettings[setting] = this.defaultUserSettings[setting];
        }
    }
}

class StorageManager {
    // Get custom packs saved in GM storage
    static async loadPackProfile(profileName) {
        let savedPackProfile = CustomPackProfile.fromObject(await GM.getValue("customPackProfile_" + profileName, new CustomPackProfile()));
        return savedPackProfile;
    }

    // Save custom packs to GM storage
    static async savePackProfile(packProfile, profileName) {
        GM.setValue("customPackProfile_" + profileName, packProfile);
    }

    // Settings
    static async saveSettings() {
        GM.setValue("custom_srs_user_data", CustomSRSSettings.userSettings);
        GM.setValue("custom_srs_saved_data", CustomSRSSettings.savedData);
    }
    static async loadSettings() {
        CustomSRSSettings.userSettings = await GM.getValue("custom_srs_user_data", CustomSRSSettings.userSettings);
        CustomSRSSettings.validateSettings();
        CustomSRSSettings.savedData = await GM.getValue("custom_srs_saved_data", CustomSRSSettings.savedData);
    }

    static packFromJSON(json) {
        let pack = CustomItemPack.fromObject(json);
        return pack;
    }
    static packToJSON(pack) {
        let packJSON = JSON.parse(JSON.stringify(pack));
        if(!CustomSRSSettings.userSettings.exportSRSData) {
            packJSON.items.forEach(item => {
                item.last_reviewed_at = 0;
                item.info.srs_lvl = 0;
            });
        }
        return JSON.stringify(packJSON);
    }
}
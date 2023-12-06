const srsGaps = [0, 4*60*60*1000, 8*60*60*1000, 23*60*60*1000, 47*60*60*1000, 167*60*60*1000, 335*60*60*1000, 730*60*60*1000, 2920*60*60*1000]


class CustomItem {
    // WK variables
    id;
    type; // KanaVocabulary, Vocabulary, Kanji, Radical
    subject_category; // Vocabulary, Kanji, Radical
    characters;
    meanings;
    auxiliary_meanings = [];
    readings;
    auxiliary_readings = [];
    kanji = [];

    // Custom variables
    srs_stage = 0;
    last_reviewed_at = 0;

    constructor(id, type, subject_category, characters, meanings, readings) {
        this.id = id;
        this.type = type;
        this.subject_category = subject_category;
        this.characters = characters;
        this.meanings = meanings;
        this.readings = readings;
        this.last_reviewed_at = Date.now();
    }

    set auxiliary_meanings(auxiliary_meanings) {
        this.auxiliary_meanings = auxiliary_meanings;
    }
    set auxiliary_readings(auxiliary_readings) {
        this.auxiliary_readings = auxiliary_readings;
    }
    set kanji(kanji) {
        this.kanji = kanji;
    }

    getQueueItem(packID) {
        return {
            id: MathUtils.cantorNumber(packID, this.id),
            type: this.type,
            subject_category: this.subject_category,
            characters: this.characters,
            meanings: this.meanings,
            auxiliary_meanings: this.auxiliary_meanings,
            readings: this.readings,
            auxiliary_readings: this.auxiliary_readings,
            kanji: this.kanji
        };
    }

    incrementSRS() {
        if(this.srs_stage < 9) this.srs_stage++;
        this.last_reviewed_at = Date.now();
    }
    decrementSRS() {
        if(this.srs_stage > 1) {
            if(this.srs_stage < 5) this.srs_stage--;
            else this.srs_stage -= 2;
        }
        this.last_reviewed_at = Date.now();
    }
    set srs_stage(srs_stage) {
        this.srs_stage = srs_stage;
        this.last_reviewed_at = Date.now();
    }
}

class CustomItemPack {
    name;
    author;
    version;
    items = [];

    constructor(name, author, version) {
        this.name = name;
        this.author = author;
        this.version = version;
    }

    getItem(id) {
        return this.items[id];
    }

    addItem(type, subject_category, characters, meanings, readings) {
        let id = this.items.length;
        let item = new CustomItem(id, type, subject_category, characters, meanings, readings);
        this.items.push(item);
    }

    editItem(id, type, subject_category, characters, meanings, readings) {
        let item = this.items[id];
        item.type = type;
        item.subject_category = subject_category;
        item.characters = characters;
        item.meanings = meanings;
        item.readings = readings;
    }

    removeItem(id) {
        this.items.splice(id, 1);
    }

    getActiveReviews(packID) { // Get all items that were last reviewed more than 24 hours ago
        return this.items.filter(item => item.last_reviewed_at < Date.now() - srsGaps[item.srs_stage] && item.srs_stage > -1).map(item => item.getQueueItem(packID)); // TODO: Change SRS stage check
    }
}

class customPackProfile {
    customPacks = [];

    addPack(newPack) {
        this.customPacks.push(newPack);
    }
    removePack(id) {
        this.customPacks.splice(id, 1);
    }

    getActiveReviews() {
        let activeReviews = [];
        for(let i = 0; i < this.customPacks.length; i++) {
            activeReviews.push(...this.customPacks[i].getActiveReviews(i));
        }
        return activeReviews;
    }

    submitReview(cantorNum, meaningIncorrectNum, readingIncorrectNum) {
        let [packID, itemID] = MathUtils.reverseCantorNumber(cantorNum);
        let item = this.customPacks[packID].items[itemID];
        if(meaningIncorrectNum > 0) {
            item.decrementSRS();
        } else if(readingIncorrectNum > 0) {
            item.decrementSRS();
        } else {
            item.incrementSRS();
        }
    }
}

// ------------------- Utility classes -------------------
class MathUtils {
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
}

class StorageManager {
    // Get custom packs saved in GM storage
    static loadPackProfile(profileName) {
        let savedPackProfile = GM_getValue("customPackProfile_" + profileName, new customPackProfile());
        return savedPackProfile;
    }

    // Save custom packs to GM storage
    static savePackProfile(packProfile, profileName) {
        //GM_setValue("customPackProfile_" + profileName, packProfile);
    }
}

class TestData {
    // Create pack with custom test items
    static createTestPack() {
        let testPack = new CustomItemPack("Test Pack", "Test Author", 0.1);
        testPack.addItem("Vocabulary", "Vocabulary", "猫猫", ["cat"], [{"reading": "ねこ", "pronunciations": []}]);
        //testPack.addItem("Vocabulary", "Vocabulary", "犬犬", ["dog"], [{"reading": "いぬ", "pronunciations": []}]);
        //testPack.addItem("Vocabulary", "Vocabulary", "鳥鳥", ["bird"], [{"reading": "とり", "pronunciations": []}]);
        //testPack.addItem("Vocabulary", "Vocabulary", "魚魚", ["fish"], [{"reading": "さかな", "pronunciations": []}]);
        return testPack;
    }
}
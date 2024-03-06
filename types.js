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
            readings: this.readings.map(reading => ({"reading": reading, "pronunciations": []})),
            auxiliary_readings: this.auxiliary_readings,
            kanji: this.kanji
        };
    }

    isReadyForReview() {
        return this.last_reviewed_at < Date.now() - srsGaps[this.srs_stage] && this.srs_stage > -1; // TODO: Change SRS stage check to > 0 once lessons are implemented
    }

    incrementSRS() {
        if(this.srs_stage < 9) this.srs_stage++;
        this.last_reviewed_at = Date.now();
        StorageManager.savePackProfile(activePackProfile, "main");
    }
    decrementSRS() {
        if(this.srs_stage > 1) {
            if(this.srs_stage < 5) this.srs_stage--;
            else this.srs_stage -= 2;
        }
        this.last_reviewed_at = Date.now();
        StorageManager.savePackProfile(activePackProfile, "main");
    }
    set srs_stage(srs_stage) {
        this.srs_stage = srs_stage;
        this.last_reviewed_at = Date.now();
    }
    getSRSText(packID) {
        return "[" + MathUtils.cantorNumber(packID, this.id) + "," + this.srs_stage + "]";
    }

    static fromObject(object) {
        let item = new CustomItem(object.id, object.type, object.subject_category, object.characters, object.meanings, object.readings);
        item.auxiliary_meanings = object.auxiliary_meanings;
        item.auxiliary_readings = object.auxiliary_readings;
        item.kanji = object.kanji;
        item.srs_stage = object.srs_stage;
        item.last_reviewed_at = object.last_reviewed_at;
        return item;
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
        return this.items.filter(item => item.isReadyForReview()).map(item => item.getQueueItem(packID)); // TODO: Change SRS stage check
    }
    getActiveReviewsSRSText(packID) {
        return this.items.filter(item => item.isReadyForReview()).map(item => item.getSRSText(packID));
    }
    getNumActiveReviews() {
        return this.items.filter(item => item.isReadyForReview()).length;
    }

    static fromObject(object) {
        let pack = new CustomItemPack(object.name, object.author, object.version);
        pack.items = object.items.map(item => CustomItem.fromObject(item));
        return pack;
    }
}

class CustomPackProfile {
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
    getNumActiveReviews() {
        return this.customPacks.reduce((acc, pack) => acc + pack.getNumActiveReviews(), 0);
    }
    getActiveReviewsSRS() {
        let activeReviewsSRS = [];
        for(let i = 0; i < this.customPacks.length; i++) {
            activeReviewsSRS.push(...this.customPacks[i].getActiveReviewsSRSText(i));
        }
        return activeReviewsSRS;
    }

    getSubjectInfo(cantorNum) {
        let [packID, itemID] = MathUtils.reverseCantorNumber(cantorNum);
        let item = this.customPacks[packID].items[itemID];
        return makeDetailsHTML(item);
    }

    submitReview(cantorNum, meaningIncorrectNum, readingIncorrectNum) {
        let [packID, itemID] = MathUtils.reverseCantorNumber(cantorNum);
        let item = this.customPacks[packID].items[itemID];
        if(meaningIncorrectNum > 0 || readingIncorrectNum > 0) {
            item.decrementSRS();
        } else {
            item.incrementSRS();
        }
    }

    static fromObject(object) {
        let packProfile = new CustomPackProfile();
        packProfile.customPacks = object.customPacks.map(pack => CustomItemPack.fromObject(pack));
        return packProfile;
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
    static async loadPackProfile(profileName) {
        let savedPackProfile = new CustomPackProfile();
        Object.assign(savedPackProfile, await GM.getValue("customPackProfile_" + profileName, new CustomPackProfile()));
        // Convert CustomItemPacks and their CustomItems
        savedPackProfile.customPacks = savedPackProfile.customPacks.map(pack => CustomItemPack.fromObject(pack));
        return savedPackProfile;
    }

    // Save custom packs to GM storage
    static async savePackProfile(packProfile, profileName) {
        GM.setValue("customPackProfile_" + profileName, packProfile);
    }
}

class TestData {
    // Create pack with custom test items
    static createTestPack() {
        let testPack = new CustomItemPack("Test Pack", "Test Author", 0.1);
        testPack.addItem("Vocabulary", "Vocabulary", "猫猫", ["cat"], ["ねこ"]);
        testPack.addItem("Vocabulary", "Vocabulary", "犬犬", ["dog"], ["いぬ"]);
        testPack.addItem("Vocabulary", "Vocabulary", "鳥鳥", ["bird"], [とり]);
        testPack.addItem("Vocabulary", "Vocabulary", "魚魚", ["fish"], ["さかな"]);
        return testPack;
    }
}
const srsGaps = [0, 4*60*60*1000, 8*60*60*1000, 23*60*60*1000, 47*60*60*1000, 167*60*60*1000, 335*60*60*1000, 730*60*60*1000, 2920*60*60*1000]

class CustomItem {
    // WK variables
    id;
    type; // KanaVocabulary, Vocabulary, Kanji, Radical
    subject_category; // Vocabulary, Kanji, Radical
    characters;
    meanings;
    auxiliary_meanings = [];

    // Custom variables
    srs_stage = 0;
    last_reviewed_at = 0;
    meaning_explanation = "This item does not have a meaning explanation.";

    constructor(id, type, subject_category, characters, meanings) {
        this.id = id;
        this.type = type;
        this.subject_category = subject_category;
        this.characters = characters;
        this.meanings = meanings;
        this.last_reviewed_at = Date.now();
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
    getSRSText(packID) {
        return "[" + MathUtils.cantorNumber(packID, this.id) + "," + this.srs_stage + "]";
    }

    static fromObject(object) {
        let item;
        switch(object.type) {
            case "Radical":
                item = new RadicalCustomItem(object.id, object.type, object.subject_category, object.characters, object.meanings);
                break;
            case "Kanji":
                item = new KanjiCustomItem(object.id, object.type, object.subject_category, object.characters, object.meanings, object.primary_reading_type, object.onyomi, object.kunyomi, object.nanori);
                break;
            case "Vocabulary":
                item = new VocabularyCustomItem(object.id, object.type, object.subject_category, object.characters, object.meanings, object.readings);
                break;
            case "KanaVocabulary":
                item = new KanaVocabularyCustomItem(object.id, object.type, object.subject_category, object.characters, object.meanings, object.readings);
                break;
        }
        /*item.auxiliary_meanings = object.auxiliary_meanings;
        item.auxiliary_readings = object.auxiliary_readings;
        item.kanji = object.kanji;*/
        item.srs_stage = object.srs_stage;
        item.last_reviewed_at = object.last_reviewed_at;
        return item;
    }
}

class RadicalCustomItem extends CustomItem {
    kanji = [];

    constructor(id, type, subject_category, characters, meanings) {
        super(id, type, subject_category, characters, meanings);
    }

    getQueueItem(packID) {
        return {
            id: MathUtils.cantorNumber(packID, this.id),
            type: this.type,
            subject_category: this.subject_category,
            characters: this.characters,
            meanings: this.meanings,
            auxiliary_meanings: this.auxiliary_meanings,
            kanji: this.kanji
        };
    }
}

class KanjiCustomItem extends CustomItem {
    primary_reading_type;
    onyomi = [];
    kunyomi = [];
    nanori = [];
    radicals = [];
    vocabulary = [];
    reading_explanation = "This item does not have a reading explanation.";

    constructor(id, type, subject_category, characters, meanings, primary_reading_type, onyomi, kunyomi, nanori) {
        super(id, type, subject_category, characters, meanings);
        this.primary_reading_type = primary_reading_type;
        this.onyomi = onyomi;
        this.kunyomi = kunyomi;
        this.nanori = nanori;
    }

    getQueueItem(packID) {
        return {
            id: MathUtils.cantorNumber(packID, this.id),
            type: this.type,
            subject_category: this.subject_category,
            characters: this.characters,
            meanings: this.meanings,
            auxiliary_meanings: this.auxiliary_meanings,
            primary_reading_type: this.primary_reading_type,
            onyomi: this.onyomi,
            kunyomi: this.kunyomi,
            nanori: this.nanori,
            auxiliary_readings: [],
            radicals: this.radicals,
            vocabulary: this.vocabulary
        };
    }
}

class VocabularyCustomItem extends CustomItem {
    readings;
    auxiliary_readings = [];
    kanji = [];
    reading_explanation = "This item does not have a reading explanation.";

    constructor(id, type, subject_category, characters, meanings, readings) {
        super(id, type, subject_category, characters, meanings);
        this.readings = readings;
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
}

class KanaVocabularyCustomItem extends CustomItem {
    readings;
    reading_explanation = "This item does not have a reading explanation.";

    constructor(id, type, subject_category, characters, meanings, readings) {
        super(id, type, subject_category, characters, meanings);
        this.readings = readings;
    }

    getQueueItem(packID) {
        return {
            id: MathUtils.cantorNumber(packID, this.id),
            type: this.type,
            subject_category: this.subject_category,
            characters: this.characters,
            meanings: this.meanings,
            auxiliary_meanings: this.auxiliary_meanings,
            readings: this.readings.map(reading => ({"reading": reading, "pronunciations": []}))
        };
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
    addRadical(characters, meanings) {
        let id = this.items.length;
        let radical = new RadicalCustomItem(id, "Radical", "Radical", characters, meanings);
        this.items.push(radical);
    }
    addKanji(characters, meanings, primary_reading_type, onyomi, kunyomi, nanori) {
        let id = this.items.length;
        let kanji = new KanjiCustomItem(id, "Kanji", "Kanji", characters, meanings, primary_reading_type, onyomi, kunyomi, nanori);
        this.items.push(kanji);
    }
    addVocabulary(characters, meanings, readings) {
        let id = this.items.length;
        let vocabulary = new VocabularyCustomItem(id, "Vocabulary", "Vocabulary", characters, meanings, readings);
        this.items.push(vocabulary);
    }
    addKanaVocabulary(characters, meanings, readings) {
        let id = this.items.length;
        let kanaVocabulary = new KanaVocabularyCustomItem(id, "KanaVocabulary", "Vocabulary", characters, meanings, readings);
        this.items.push(kanaVocabulary);
    }
    editRadical(id, characters, meanings) {
        let radical = this.items[id];
        radical.characters = characters;
        radical.meanings = meanings;
    }
    editKanji(id, characters, meanings, primary_reading_type, onyomi, kunyomi, nanori) {
        let kanji = this.items[id];
        kanji.characters = characters;
        kanji.meanings = meanings;
        kanji.primary_reading_type = primary_reading_type;
        kanji.onyomi = onyomi;
        kanji.kunyomi = kunyomi;
        kanji.nanori = nanori;
    }
    editVocabulary(id, characters, meanings, readings) {
        let vocabulary = this.items[id];
        vocabulary.characters = characters;
        vocabulary.meanings = meanings;
        vocabulary.readings = readings;
    }
    editKanaVocabulary(id, characters, meanings, readings) {
        let kanaVocabulary = this.items[id];
        kanaVocabulary.characters = characters;
        kanaVocabulary.meanings = meanings;
        kanaVocabulary.readings = readings;
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

    getPack(id) {
        return this.customPacks[id];
    }
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
        let item = this.getPack(packID).getItem(itemID);
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
        testPack.addRadical("少", ["Radical"]);
        testPack.addKanji("犬", ["dog"], "onyomi", ["いん"], ["いぬ"], ["いぬ"]);
        testPack.addVocabulary("猫猫", ["cat"], ["ねこ"]);
        testPack.addKanaVocabulary("いぬ", ["dog"], ["いぬ"]);
        return testPack;
    }
}
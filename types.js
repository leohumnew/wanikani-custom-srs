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
        try {
            if(object.info.kanji && object.info.kanji[0] && !object.info.kanji[0].characters) delete object.info.kanji; // Remove old component format TODO: remove after a few weeks

            let item = new CustomItem(object.id, object.info);

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
        } catch(e) {
            alert("Error loading item, please let me know what error you're getting (unless you haven't used this script since it was first released): " + e);
            if(confirm("Clear all custom SRS data to fix this issue? (should only be necessary if you haven't used the script since it was first released, otherwise message me on WK forum)")) {
                StorageManager.deletePackProfile("main");
            }
            return null;
        }
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

    getProgressHTML() {
        if(!this.active) return;
        let progressByLevel = {};
        this.items.forEach(item => {
            if(this.lvlType == "none" || !item.info.lvl) {
                if(!progressByLevel["noLevel"]) progressByLevel["noLevel"] = [];
                if(item.info.srs_lvl > 4) progressByLevel["noLevel"][5] = (progressByLevel["noLevel"][5] || 0) + 1;
                else progressByLevel["noLevel"][item.info.srs_lvl] = (progressByLevel["noLevel"][item.info.srs_lvl] || 0) + 1;
                progressByLevel["noLevel"][6] = (progressByLevel["noLevel"][6] || 0) + 1;
            } else if(this.lvlType == "internal" && item.info.lvl > this.lvl) progressByLevel["locked"] = (progressByLevel["locked"] || 0) + 1;
            else if(this.lvlType == "wk" && item.info.lvl > CustomSRSSettings.userSettings.lastKnownLevel) progressByLevel["locked"] = (progressByLevel["locked"] || 0) + 1;
            else {
                if(!progressByLevel[item.info.lvl]) progressByLevel[item.info.lvl] = [];
                if(item.info.srs_lvl > 4) progressByLevel[item.info.lvl][5] = (progressByLevel[item.info.lvl][5] || 0) + 1;
                else progressByLevel[item.info.lvl][item.info.srs_lvl] = (progressByLevel[item.info.lvl][item.info.srs_lvl] || 0) + 1;
                progressByLevel[item.info.lvl][6] = (progressByLevel[item.info.lvl][6] || 0) + 1;
            }
        });
        let progressHTML = "";
        for(let level in progressByLevel) {
            if(level != "locked") {
                progressHTML += "<p>Level " + (level == "noLevel" ? "--" : level) + "</p><div class='progress-bar'>";
                for(let i = 5; i > 0; i--) {
                    progressHTML += "<div style='width: " + (progressByLevel[level][i] || 0) / progressByLevel[level][6]*100 + "%' title='" + (i == 5 ? "Guru+" : srsNames[i]) + " (" + progressByLevel[level][i] + "/" + progressByLevel[level][6] + ")'></div>";
                }
                progressHTML += "</div>";
            }
        }
        return progressHTML;
    }


    static fromObject(object) {
        let pack = new CustomItemPack(object.name, object.author, object.version, (object.lvlType || "none"), (object.lvl || 1)); // TODO: Remove lvlType and lvl checks after a few weeks
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
                    if(item.info.lvl && item.info.lvl <= pack.lvl && item.info.srs_lvl < 5) return;
                }
                pack.lvl++;
                StorageManager.savePackProfile(this, "main");
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
    static verbIDs;
    static levelVerbCount;
    static activeQueue;
    static rootEnds = [
        ["わ", "か", "さ", "た", "な", "ば", "ま", "ら", "が"],
        ["い", "き", "し", "ち", "に", "び", "み", "り", "ぎ"],
        ["う", "く", "す", "つ", "ぬ", "ぶ", "む", "る", "ぐ"],
        ["え", "け", "せ", "て", "ね", "べ", "め", "れ", "げ"],
        ["お", "こ", "そ", "と", "の", "ぼ", "も", "ろ", "ご"],
        ["って", "いて", "して", "って", "んで", "んで", "んで", "って", "いで"],
        ["った", "いた", "した", "った", "んだ", "んだ", "んだ", "った", "いだ"]
    ];
    static conjugations = { // Name : [godan kana row, general ending, pretty name, explanation, ichidan ending {optional}]
        "te": [5, "て", "-te", "This is the te-form of the verb, used for connecting the verb to a word or clause that follows it."],
        "ta": [6, "た", "past", "This is the ta-form of the verb, used for past tense."],
        "masu": [1, "ます", "formal", "This is the present/future keigo form of the verb, used in polite speech."],
        "mashita": [1, "ました", "past formal", "This is the past keigo form of the verb, used in polite speech."],
        "masen": [1, "ません", "negative formal", "This is the negative keigo form of the verb, used in polite speech."],
        "masendeshita": [1, "ませんでした", "past negative formal", "This is the negative past keigo form of the verb, used in polite speech."],
        "tai": [1, "たい", "'want'", "This is the 'want to do' form of the verb."],
        "nai": [0, "ない", "negative", "This is the standard negative form of the verb."],
        "reru": [0, "れる", "receptive", "This is the receptive (similar to passive) form of the verb, used when something is done to the subject.", "られる"],
        "seru": [0, "せる", "causative", "This is the causative form of the verb, used when allowing, making, or causing something to happen.", "させる"]
    };
    static irregularVerbs = {
        "する": {"gen": "し", "reru": "さ", "seru": "さ"},
        "来る": {"gen": "き", "nai": "こ", "reru": "こら", "seru": "こさ"},
        "有る": {"nai": ""},
        "行く": {"te": "いって", "ta": "いった"}
    };

    static init() {
        this.verbIDs = new Uint16Array(1045);
        this.verbIDs = [2480,2490,2495,2492,2557,2572,2586,2576,2603,2606,2609,2614,2641,8945,2578,2645,2671,2697,2699,2706,2723,2729,2733,8660,8961,2481,2491,2494,2556,2577,2587,2598,2613,2698,2740,2742,2750,2756,2765,2775,2787,2805,2824,2838,2840,2601,2724,2776,2868,2874,2901,2902,2914,2923,2926,3406,3418,3496,3817,4378,7477,7671,7681,8697,2599,2720,2903,2937,2941,2971,4070,4071,7677,8738,2700,2966,2992,2994,2997,3007,3015,3018,3025,3052,3054,3065,3074,3434,3435,3453,3461,3462,3463,3464,3465,3467,3468,7530,8938,2816,3088,3091,3106,3112,3130,3142,3144,3148,3429,3466,3475,3476,3479,3523,3807,4147,4377,7478,7741,9261,9279,3097,3113,3159,3162,3167,3171,3172,3174,3177,3180,3183,3185,3189,3192,3208,3215,3217,3222,3445,3488,3491,3492,3493,3494,3506,3707,7575,7621,7686,9240,9250,3149,3238,3245,3252,3267,3277,3278,3281,3284,3285,3287,3288,3291,3305,3310,3316,3490,3505,3507,3508,3509,4148,4217,7497,7514,7626,8932,8939,8951,3098,3128,3333,3337,3352,3391,3393,3424,3556,3557,3558,3561,3562,3563,3565,3566,3582,3925,4073,7748,8933,8946,3394,3524,3554,3571,3576,3577,3578,3579,3580,3583,3586,3587,3594,3605,3624,3628,3639,3888,7495,7496,8943,9245,3129,3489,3662,3666,3684,3689,3700,3705,3798,3880,3881,3883,3884,3885,3886,3887,3889,3902,3944,3946,6946,8954,3575,3732,3755,3756,3767,3776,3904,3905,3906,5927,5983,7540,7697,7754,8952,9244,9249,9269,3720,3826,3828,3838,3843,3849,3856,3866,3870,3920,3922,3929,3930,3931,7755,8947,9262,9276,9294,3797,3823,3845,3976,3985,3994,4005,7588,7589,7700,7759,4065,4082,4091,4102,4105,4107,4111,4115,4146,4152,7479,7645,7646,8710,8852,8927,8997,9021,9247,2634,4166,4189,4198,4210,4220,4222,4225,4226,4243,4367,4372,6301,7550,8944,9295,9304,4181,4204,4221,4254,4261,4278,4304,4317,4334,4345,4370,8953,9027,9085,9253,4122,4309,4381,4384,4388,4391,4392,4393,4407,4409,4417,4425,4426,4443,4451,4454,4456,4458,4464,4472,4474,6457,8712,8888,8998,9086,9283,4389,4480,4482,4488,4492,4497,4499,4502,4514,4526,4533,4552,4561,4562,4582,4841,4843,4844,4845,4852,7502,7597,8867,4390,4577,4578,4581,4607,4613,4617,4625,4627,4631,4642,4648,4652,4853,4854,4855,4856,4857,4858,5937,7507,7765,7779,8931,8936,4655,4657,4660,4668,4687,4689,4695,4700,4710,4714,4725,4741,4752,4755,4865,4866,4869,4870,6235,7711,3800,4747,4763,4764,4766,4767,4768,4769,4773,4777,4779,4782,4788,4792,4797,4805,4812,4822,4827,4830,4834,4836,4837,4878,4879,4885,7600,7724,8680,8716,8809,8868,8905,9257,4012,4778,4838,4883,4895,4901,4903,4907,4908,4910,4912,4924,4925,4948,4949,4960,4966,4967,4977,4978,4994,4998,7160,7769,9072,4771,4810,5001,5002,5003,5004,5018,5019,5021,5025,5027,5029,5036,5069,5070,5072,5079,5082,5084,5088,5093,5096,5103,5197,7656,7770,8541,8940,8949,9307,5028,5039,5092,5109,5124,5152,5160,5161,5163,5178,5190,5200,5262,5284,5388,5751,8757,9252,5009,5031,5076,5081,5213,5216,5220,5242,5249,5255,5263,5266,5273,5280,5282,5288,5290,5396,5397,6295,7772,8684,9045,9296,5283,5297,5300,5308,5310,5316,5317,5320,5330,5333,5336,5338,5343,5356,5373,5376,5380,5381,5383,5386,5399,5504,5701,6456,8842,8875,8929,8930,8934,9080,9263,5337,5403,5404,5406,5407,5410,5414,5421,5433,5436,5443,5447,5449,5466,5467,5483,5491,5497,5702,5703,5704,5705,5706,8935,5508,5511,5512,5516,5517,5526,5560,5575,5582,5585,5596,5600,5606,5608,5609,5610,5708,8723,8876,8956,4277,5611,5613,5618,5629,5640,5643,5648,5653,5657,5665,5672,5681,5691,5709,5710,5711,5712,5713,5721,5722,5726,5728,5729,5730,5732,5735,5736,5738,5742,5757,5763,5784,5789,5790,5795,5796,5801,5813,5816,5820,5829,5834,8725,8878,3207,5725,5837,5839,5840,5841,5845,5847,5850,5851,5857,5858,5859,5863,5867,5877,5917,7776,8917,9059,5562,5940,5957,5970,5974,5981,5986,5988,6001,6006,6009,6015,6028,6238,9266,6038,6040,6041,6043,6050,6055,6063,6067,6073,6075,6079,6080,6081,6084,6098,6102,6108,6109,6120,6123,6128,6130,6131,6137,6078,6142,6143,6144,6146,6153,6162,6163,6166,6168,6169,6174,6178,6179,6182,6191,6196,6203,6213,6216,6219,6222,6223,6229,6230,6232,6233,8983,9272,9297,5022,6241,6243,6245,6246,6247,6250,6255,6258,6267,6268,6289,6303,6305,6306,6308,6318,6322,7511,6340,6341,6342,6344,6345,6348,6349,6350,6352,6357,6360,6366,6369,6380,6386,6393,6395,6405,6413,6424,6433,6441,6444,8928,9154,6454,6455,6469,6475,6476,6488,6495,6514,6526,6540,6551,6554,6557,6560,6561,6562,6583,6589,6592,6594,6595,6598,6617,6618,6623,6627,6644,6936,6937,6938,6939,6940,6942,7558,7725,6658,6661,6681,6699,6711,6718,6732,6740,6944,6945,8942,6731,6753,6759,6760,6761,6766,6767,6783,6801,6812,6815,6935,6941,6949,8926,6763,6765,6844,6846,6852,6855,6856,6886,6890,6892,6897,6899,6908,6923,6925,6931,6933,6955,9008,9034,6988,7024,7031,7038,7041,7044,7782,6721,7007,7056,7060,7064,7103,7105,7107,7109,7120,7143,7144,9060,7057,7123,7163,7171,7172,7185,7195,7198,7205,7208,7213,7220,7229,7232,7245,7251,8937,7267,7281,7288,7290,7306,7311,7314,7317,7326,7336,7341,7349,7434,8890,8920,8921,8941,8948,4974,7358,7385,7392,7397,7404,7436,7438,7440,7444,7667,8950,7787,7789,7796,7798,7799,7802,7818,7832,7857,8813,9001,7863,7878,7892,7916,7930,7939,7946,7968,7976,7988,7989,7994,7995,8021,8043,8044,8073,8081,8086,8094,8137,8146,8153,8179,8190,8200,8206,8213,8246,8262,8288,8316,8318,8328,8339,8359,8381,8417,8424,8425,9053,8437,8441,8463,8470,8477,8504,8510,8518,8521,8527,8558,8568,8579,8581,8602,8618,8632,8635,9116,9117];
        this.levelVerbCount = [3,7,14,25,45,64,74,99,121,152,181,203,225,247,265,284,295,314,331,346,373,396,421,441,475,500,530,548,572,603,627,647,666,692,712,727,751,781,800,825,838,860,871,886,906,913,926,943,961,973,984,991,1000,1007,1013,1019,1025,1032,1039,1045];
    }
    static async getRandomVerbInfo(quantity) {
        let verbInfo = [];
        for(let i = 0; i < quantity; i++) {
            let verbID = this.verbIDs[Math.floor(Math.random() * this.levelVerbCount[(CustomSRSSettings.userSettings.lastKnownLevel == 60) ? 59 : CustomSRSSettings.userSettings.lastKnownLevel - 3])];
            verbInfo.push(verbID);
        }
        // Make one request to get all verb info from WK API
        let verbInfoString = verbInfo.join(",");
        let response = await Utils.wkAPIRequest("subjects?ids=" + verbInfoString);
        for(let i = 0; i < verbInfo.length; i++) {
            verbInfo[i] = response.data.find(item => item.id === verbInfo[i]);
        }
        return verbInfo;
    }

    static conjugateVerb(verb, type, form, characters) {
        switch(type) {
            case "godan": {
                if(this.irregularVerbs[characters]?.[form]) verb = this.irregularVerbs[characters][form]; // Check for single verb irregularities
                else {
                    let lastKanaColumn = this.rootEnds[2].indexOf(verb.slice(-1));
                    verb = verb.slice(0, -1);
                    verb += this.rootEnds[this.conjugations[form][0]][lastKanaColumn];
                }
                if(form != "te" && form != "ta") verb += this.conjugations[form][1];
                break;
            } case "ichidan":
                verb = verb.slice(0, -1);
                verb += this.conjugations[form][4] || this.conjugations[form][1];
                break;
            case "irregular":
                if(characters.includes("する")) verb = verb.slice(0, -2) + (this.irregularVerbs["する"][form] || this.irregularVerbs["する"].gen);
                else verb = this.irregularVerbs[characters][form] || this.irregularVerbs[characters].gen;
                verb += this.conjugations[form][1];
                break;
        }
        return verb;
    }
    static getConjugationQueueItem(item) {
        let conjugationKeys = Object.keys(this.conjugations).filter(c => !CustomSRSSettings.userSettings.inactiveConjugations.includes(c));
        if(conjugationKeys.length == 0) {
            alert("No conjugations selected, please select some in the settings.");
            window.location.href = "/dashboard";
        }
        const conjugationType = conjugationKeys[Math.floor(Math.random() * conjugationKeys.length)];
        const partsOfSpeech = item.data.parts_of_speech.join(" ");
        const verbType = partsOfSpeech.includes("ichidan") ? "ichidan" : partsOfSpeech.includes("godan") ? "godan" : (this.irregularVerbs[item.data.characters] || item.data.characters.includes("する")) ? "irregular" : "ichidan"; // Determine verb type
        return {
            id: -item.id,
            type: "Vocabulary",
            subject_category: "Vocabulary",
            characters: item.data.characters + "\n" + this.conjugations[conjugationType][2] + " form",
            meanings: item.data.meanings.map(m => m.meaning) || [],
            auxiliary_meanings: item.data.auxiliary_meanings || [],
            readings: [{"reading": this.conjugateVerb(item.data.readings[0].reading, verbType, conjugationType, item.data.characters), "pronunciations": []}],
            auxiliary_readings: item.data.auxiliary_readings || [],
            kanji: [],
            verbType: verbType,
            conjugationType: conjugationType,
            ogChar: item.data.characters,
            ogReading: item.data.readings[0].reading
        };
    }

    static async getConjugationSessionItems(quantity) {
        if(CustomSRSSettings.userSettings.lastKnownLevel < 3) {
            alert("WK level too low, conjugation practice requires at least level 3.");
            window.location.href = "/dashboard";
        }

        Conjugations.init();
        let items = await Conjugations.getRandomVerbInfo(quantity);

        if(items.length < quantity) {
            alert("Not enough verbs unlocked yet, try again once you've increased your WK level!");
            window.location.href = "/dashboard";
            return;
        }

        // Set up items
        let srsItems = [], verbItems = [];
        for(let item of items) {
            srsItems.push([-item.id, 0]);
            verbItems.push(this.getConjugationQueueItem(item));
        }
        this.activeQueue = verbItems;
        return [verbItems, srsItems];
    }

    static getSubjectInfo(subjectID) { // Get details of item for review page details display
        let item = this.activeQueue.find(item => item.id === parseInt(subjectID));
        return makeDetailsHTMLConjugation(item, this.conjugations[item.conjugationType][2], this.conjugations[item.conjugationType][3]);
    }

    static getSettingsHTML() {
        let container = document.createElement("div");
        container.classList.add("component-div");
        container.style.gridColumn = "span 2";
        for(let conjugation in this.conjugations) {
            let label = document.createElement("label");
            label.innerHTML = this.conjugations[conjugation][2] + " form";
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = !CustomSRSSettings.userSettings.inactiveConjugations.includes(conjugation);
            checkbox.onchange = function() {
                if(checkbox.checked) CustomSRSSettings.userSettings.inactiveConjugations = CustomSRSSettings.userSettings.inactiveConjugations.filter(c => c != conjugation);
                else CustomSRSSettings.userSettings.inactiveConjugations.push(conjugation);
                StorageManager.saveSettings();
            };
            container.append(label, checkbox);
        }
        return container;
    }
}

// ------------------- Audio Quiz -------------------
class AudioQuiz {
    static activeItemLink;

    static addAudioQuizItem(id, audioURL) {
        this.activeQueueLinks[id] = audioURL;
    }

    static async playActiveQuizItemAudio() {
        if(!this.activeItemLink) return;
        let audio = new Audio(this.activeItemLink);
        audio.play();
    }

    static setUpAudioQuizHTML() {
        let soundIcon = Icons.customIcon("sound-on");
        soundIcon.classList.add("sound-icon");
        soundIcon.style.width = "100%";
        soundIcon.style.height = "7.5rem";
        soundIcon.onclick = () => this.playActiveQuizItemAudio();

        document.getElementById("custom-srs-header-style").innerHTML += ".character-header .character-header__characters { height: 0 } .character-header__content { cursor: pointer }";

        let audioButton = document.querySelector("a.additional-content__item.additional-content__item--audio");
        audioButton.onclick = () => this.playActiveQuizItemAudio();
        audioButton.style.cursor = "pointer";

        window.addEventListener("willShowNextQuestion", (e) => {
            this.activeItemLink = e.detail.subject?.readings[0].pronunciation.sources[0]?.url;
            this.playActiveQuizItemAudio();
        });

        return soundIcon;
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
                console.log("Error getting controller " + name);
            }
            console.log("Waiting for controller " + name);
            await new Promise(r => setTimeout(r, 50));
        }
        return controller;
    }
    static async setMeaningsOnly() {
        let controller = await Utils.get_controller("quiz-queue");
        controller = controller.quizQueue.stats;

        const originalGet = controller.get.bind(controller);
        controller.get = function(t) {
            let stat = originalGet(t);
            stat.reading.complete = true;
            return stat;
        };
    }
    static async setReadingsOnly() {
        let controller = await Utils.get_controller("quiz-queue");
        controller = controller.quizQueue.stats;

        const originalGet = controller.get.bind(controller);
        controller.get = function(t) {
            let stat = originalGet(t);
            stat.meaning.complete = true;
            return stat;
        };
    }

    static async wkAPIRequest(endpoint, method = "GET", data = null) {
        if(!CustomSRSSettings.userSettings.apiKey) {
            console.error("CustomSRS: No API key set");
            return;
        }
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
        itemQueueMode: "weighted-start",
        exportSRSData: false,
        lastKnownLevel: 0,
        apiKey: null,
        enabledConjGrammar: true,
        conjGrammarSessionLength: 10,
        inactiveConjugations: []
    };
    static userSettings = this.defaultUserSettings;
    static savedData = {
        capturedWKReview: null
    };
    static validateSettings() {
        for(let setting in this.defaultUserSettings) {
            if(this.userSettings[setting] === undefined) this.userSettings[setting] = this.defaultUserSettings[setting];
        }
        // Prompt user for API key if not set
        if(!this.userSettings.apiKey) {
            if(confirm("Custom SRS: No API key set, would you like to set it now? CustomSRS will not work properly without it. It can be found in your WaniKani account settings > API Keys.")) {
                let apiKey = prompt("Please enter your WaniKani API key:");
                if(apiKey) {
                    this.userSettings.apiKey = apiKey;
                    StorageManager.saveSettings();
                } else {
                    alert("Custom SRS: No API key set, Custom SRS will not work properly without it.");
                    console.error("Custom SRS: No API key set");
                }
            } else {
                alert("Custom SRS: No API key set, Custom SRS will not work properly without it. Reload the page or go to the CustomSRS settings tab to set it.");
                console.error("Custom SRS: No API key set");
            }
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
    static async deletePackProfile(profileName) {
        GM.deleteValue("customPackProfile_" + profileName);
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
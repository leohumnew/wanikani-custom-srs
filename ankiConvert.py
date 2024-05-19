import json
import re

# Replacement function
def replace_with_tags(match):
    word = match.group(1)
    return f'<me>{word}</me>'

# Function to create a new JSON object based on the original
def transform_json(original_json):
    new_json = {
        "name": original_json["name"],
        "author": "Anki",
        "version": "1.0",
        "lvlType": "none",
        "items": []
    }

    # Regular expression to match square brackets with numbers
    bracket_pattern = re.compile(r'\[\d+\]')
    meaning_pattern = re.compile(r'\\\"(\w+)\\\"')
    
    # Iterate over the notes and create new items
    for idx, note in enumerate(original_json["notes"]):
        new_item = {
            "id": idx,
            "info": {
                "type": ITEM_TYPE,
                "characters": note["fields"][1],
                "meanings": [note["fields"][4]],
                "meaning_expl": re.sub(meaning_pattern, replace_with_tags, re.sub(bracket_pattern, "", note["fields"][6].replace("<div>", "").replace("</div>", "").replace('<b>', "<re>").replace('</b>', "</re>"))),
                "readings": [re.sub(bracket_pattern, "", note["fields"][2])],
                "category": ITEM_CATEGORY,
                "func": ITEM_FUNCTION,
                #"ctx_jp": [note["fields"][6].replace("<div>", "").replace("</div>", "")],
                #"ctx_en": [note["fields"][7].replace("<div>", "").replace("</div>", "")],
            }
        }
        if note["fields"][4]:
            new_item["info"]["meaning_expl"] += "<br><br>" + "Originates from: " + note["fields"][4].replace("☆", "")
        
        new_json["items"].append(new_item)

    new_json["nextId"] = new_json["items"][-1]["id"] + 1
    
    return new_json

# Ask the user for the file name
FILE_NAME = input("Enter the path/name of the JSON file (without the extension): ")

# Ask the user for the item type, 0 for Radical, 1 for Kanji, 2 for Vocabulary, 3 for KanaVocabulary
ITEM_TYPE = input("Enter the item type (0 for Radical, 1 for Kanji, 2 for Vocabulary, 3 for KanaVocabulary): ")
ITEM_TYPE = 'Radical' if ITEM_TYPE == '0' else 'Kanji' if ITEM_TYPE == '1' else 'Vocabulary' if ITEM_TYPE == '2' else 'KanaVocabulary'
ITEM_CATEGORY = 'Radical' if ITEM_TYPE == 'Radical' else 'Kanji' if ITEM_TYPE == 'Kanji' else 'Vocabulary'

# Ask the user for the item function
ITEM_FUNCTION = input("Enter the function of the items (e.g. verb, noun, etc.): ")

# Read the original JSON file
with open(FILE_NAME + '.json', 'r', encoding='utf-8') as file:
    original_data = json.load(file)

# Transform the original JSON data
new_data = transform_json(original_data)

# Write the new JSON data to a file
with open(FILE_NAME + '_wksrs.json', 'w', encoding='utf-8') as file:
    json.dump(new_data, file, ensure_ascii=False, indent=2)

print("New JSON file created successfully.")

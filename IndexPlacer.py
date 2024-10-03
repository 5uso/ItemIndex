import sys, json, struct, random, amulet, math
import amulet_nbt as n
from amulet.api.entity import Entity
from amulet.api.chunk import EntityList

vanilla_enchants = {
    "protection", "fire_protection", "feather_falling", "blast_protection", "projectile_protection", "respiration", "aqua_affinity", "depth_strider", "frost_walker", "binding_curse", "sharpness", "smite", "bane_of_arthropods", "knockback", "fire_aspect", "looting", "sweeping", "efficiency", "silk_touch", "unbreaking", "fortune", "power", "punch", "flame", "luck_of_the_sea", "lure", "loyalty", "impaling", "riptide", "channeling", "mending", "vanishing_curse", "multishot", "piercing", "quick_charge", "soul_speed", "swift_sneak"
}

no_lvl_enchants = {
    "aqua_affinity", "channeling", "binding_curse", "vanishing_curse", "flame", "infinity", "mending", "multishot", "silk_touch", "aquadynamic", "bleed", "cauterize", "fatigue_cleansing", "slowness_cleansing", "weakness_cleansing", "second_wind", "soulbound", "spurs", "electrode", "explosive", "expose", "frost", "flash", "fleetfoot", "infect", "trueshot", "auto_charge", "deadeye", "current", "hydraulic", "curse_encumbering", "curse_malevolance", "curse_shattering", "curse_two_handed", "curse_irreparability",
}

enchant_display = {
    "protection": "Protection", "fire_protection": "Fire Protection", "feather_falling": "Feather Falling", "blast_protection": "Blast Protection", "projectile_protection": "Projectile Protection", "respiration": "Respiration", "aqua_affinity": "Aqua Affinity", "depth_strider": "Depth Strider", "frost_walker": "Frost Walker", "binding_curse": "Curse of Binding", "sharpness": "Sharpness", "smite": "Smite", "bane_of_arthropods": "Bane of Arthropods", "knockback": "Knockback", "fire_aspect": "Fire Aspect", "looting": "Looting", "sweeping": "Sweeping Edge", "efficiency": "Efficiency", "silk_touch": "Silk Touch", "unbreaking": "Unbreaking", "fortune": "Fortune", "power": "Power", "punch": "Punch", "flame": "Flame", "infinity": "Infinity", "luck_of_the_sea": "Luck of the Sea", "lure": "Lure", "loyalty": "Loyalty", "impaling": "Impaling", "riptide": "Riptide", "channeling": "Channeling", "mending": "Mending", "vanishing_curse": "Curse of Vanishing", "multishot": "Multishot", "piercing": "Piercing", "quick_charge": "Quick Charge", "soul_speed": "Soul Speed", "swift_sneak": "Swift Sneak", "thorns": "Thorns", "adrenaline": "Adrenaline", "agility": "Agility", "aquadynamic": "Aquadynamic", "cauterize": "Cauterize", "concealed": "Concealed", "fatigue_cleansing": "Fatigue Cleansing", "slowness_cleansing": "Slowness Cleansing", "weakness_cleansing": "Weakness Cleansing", "poison_cleansing": "Poison Cleansing", "wither_cleansing": "Wither Cleansing", "energetic": "Energetic", "evasion": "Evasion", "frenzy": "Frenzy", "lifesteal": "Lifesteal", "rally": "Rally", "regeneration": "Regeneration", "satiation": "Satiation", "second_wind": "Second Wind", "spurs": "Spurs", "bleeding": "Bleeding", "duelist": "Duelist", "echo": "Echo", "electrocute": "Electrocute", "evocation": "Evocation", "executioner": "Executioner", "exposing": "Exposing", "first_strike": "First Strike", "frostbite": "Frostbite", "hunter": "Hunter", "infection": "Infection", "singe": "Singe", "stunning": "Stunning", "surging_strike": "Surging Strike", "transfiguration": "Transfiguration", "bleed": "Bleed", "electrode": "Electrode", "explosive": "Explosive", "expose": "Expose", "frost": "Frost", "flash": "Flash", "fleetfoot": "Fleetfoot", "infect": "Infect", "point_blank": "Point Blank", "overcharge": "Overcharge", "sharpshot": "Sharpshot", "tempo_theft": "Tempo Theft", "trueshot": "Trueshot", "auto_charge": "Auto Charge", "deadeye": "Deadeye", "repeating": "Repeating", "current": "Current", "hydraulic": "Hydraulic", "ricochet": "Ricochet", "tempest": "Tempest", "eruption": "Eruption", "sapper": "Sapper", "soulbound": "Soulbound", "curse_encumbering": "Curse of Encumbering", "curse_malevolance": "Curse of Malevolance", "curse_regret": "Curse of Regret", "curse_shattering": "Curse of Shattering", "curse_two_handed": "Two Handed", "curse_irreparability": "Curse of Irreparability",
}

roman_numerals = {
    0: "0", 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI", 7: "VII", 8: "VIII", 9: "IX", 10: "X",
}

cursed_enchants = {
    "binding_curse", "vanishing_curse", "curse_encumbering", "curse_malevolance", "curse_shattering", "curse_two_handed", "curse_regret", "curse_irreparability",
}

slot_display = {
    "mainhand": "When in Main Hand:", "offhand": "When in Off Hand:", "feet": "When on Feet:", "legs": "When on Legs:", "chest": "When on Body:", "head": "When on Head:",
}

attribute_display = {
    "generic.max_health": "Max Health", "generic.knockback_resistance": "Knockback Resistance", "generic.movement_speed": "Speed", "generic.attack_damage": "Attack Damage", "generic.armor": "Armor", "generic.armor_toughness": "Armor Toughness", "generic.attack_speed": "Attack Speed",
}

defaults = {
    "dmg": {
        "type": "attack_damage",
        "slot": "mainhand",
        "values": {
            "wooden_sword": 3, "stone_sword": 4, "golden_sword": 3, "iron_sword": 5, "diamond_sword": 6, "netherite_sword": 7, "trident": 8,
            "wooden_shovel": 1.5, "wooden_pickaxe": 1, "wooden_axe": 6, "wooden_hoe": 0,
            "stone_shovel": 2.5, "stone_pickaxe": 2, "stone_axe": 8, "stone_hoe": 0,
            "golden_shovel": 1.5, "golden_pickaxe": 1, "golden_axe": 6, "golden_hoe": 0,
            "iron_shovel": 3.5, "iron_pickaxe": 3, "iron_axe": 8, "iron_hoe": 0,
            "diamond_shovel": 4.5, "diamond_pickaxe": 4, "diamond_axe": 8, "diamond_hoe": 0,
            "netherite_shovel": 5.5, "netherite_pickaxe": 5, "netherite_axe": 9, "netherite_hoe": 0,
        },
    },
    "spd": {
        "type": "attack_speed",
        "slot": "mainhand",
        "values": {
            "wooden_sword": -2.4, "stone_sword": -2.4, "golden_sword": -2.4, "iron_sword": -2.4, "diamond_sword": -2.4, "netherite_sword": -2.4, "trident": -2.9,
            "wooden_shovel": -3, "wooden_pickaxe": -2.8, "wooden_axe": -3.2, "wooden_hoe": -3,
            "stone_shovel": -3, "stone_pickaxe": -2.8, "stone_axe": -3.2, "stone_hoe": -2,
            "golden_shovel": -3, "golden_pickaxe": -2.8, "golden_axe": -3, "golden_hoe": -3,
            "iron_shovel": -3, "iron_pickaxe": -2.8, "iron_axe": -3.1, "iron_hoe": -1,
            "diamond_shovel": -3, "diamond_pickaxe": -2.8, "diamond_axe": -3, "diamond_hoe": 0,
            "netherite_shovel": -3, "netherite_pickaxe": -2.8, "netherite_axe": -3, "netherite_hoe": 0,
        },
    },
    "helm": {
        "type": "armor",
        "slot": "head",
        "values": {
            "leather_helmet": 1, "chainmail_helmet": 2, "iron_helmet": 2, "diamond_helmet": 3, "golden_helmet": 2, "netherite_helmet": 3, "turtle_helmet": 2,
        },
    },
    "ches": {
        "type": "armor",
        "slot": "chest",
        "values": {
            "leather_chestplate": 3, "chainmail_chestplate": 5, "iron_chestplate": 6, "diamond_chestplate": 8, "golden_chestplate": 5, "netherite_chestplate": 8,
        },
    },
    "pant": {
        "type": "armor",
        "slot": "legs",
        "values": {
            "leather_leggings": 2, "chainmail_leggings": 4, "iron_leggings": 5, "diamond_leggings": 6, "golden_leggings": 3, "netherite_leggings": 6,
        },
    },
    "boot": {
        "type": "armor",
        "slot": "feet",
        "values": {
            "leather_boots": 1, "chainmail_boots": 1, "iron_boots": 2, "diamond_boots": 3, "golden_boots": 1, "netherite_boots": 3,
        },
    },
    "helm_t": {
        "type": "armor_toughness",
        "slot": "head",
        "values": {
            "diamond_helmet": 2, "netherite_helmet": 3,
        },
    },
    "ches_t": {
        "type": "armor_toughness",
        "slot": "chest",
        "values": {
            "diamond_chestplate": 2, "netherite_chestplate": 3,
        },
    },
    "pant_t": {
        "type": "armor_toughness",
        "slot": "legs",
        "values": {
            "diamond_leggings": 2, "netherite_leggings": 3,
        },
    },
    "boot_t": {
        "type": "armor_toughness",
        "slot": "feet",
        "values": {
            "diamond_boots": 2, "netherite_boots": 3,
        },
    },
    "helm_k": {
        "type": "knockback_resistance",
        "slot": "head",
        "values": {
            "netherite_helmet": 0.1,
        },
    },
    "ches_k": {
        "type": "knockback_resistance",
        "slot": "chest",
        "values": {
            "netherite_chestplate": 0.1,
        },
    },
    "pant_k": {
        "type": "knockback_resistance",
        "slot": "legs",
        "values": {
            "netherite_leggings": 0.1,
        },
    },
    "boot_k": {
        "type": "knockback_resistance",
        "slot": "feet",
        "values": {
            "netherite_boots": 0.1,
        },
    },
}

with open('item_data.json','r') as f:
    ITEM_DATA = json.loads(f.read())

def query_yn(question):
    valid = {"yes": True, "y": True, "no": False, "n": False}
    while True:
        print(question, end=" [y/n] ")
        choice = input().lower()
        if choice in valid: return valid[choice]
        else: sys.stdout.write("Please respond with 'yes' or 'no'.\n")

def coords_to_chunk(x, z):
    return (x // 16, z // 16)

def distance(pos1, pos2):
    x, y, z = pos1[0] - pos2[0], pos1[1] - pos2[1], pos1[2] - pos2[2]
    return math.sqrt(x*x+y*y+z*z)

def merge_nbt(target, source):
    for k in source:
        if type(source[k]) == n.TAG_Compound:
            if k not in target: target[k] = n.TAG_Compound()
            merge_nbt(target[k], source[k])
        else:
            target[k] = source[k]

def loreLine(string, had_ability):
    string = string.replace('"','\\"')
    if len(string) > 0 and string[0] == '@': return f'''{{"text":"{string[1:]}","color":"gray","italic":false,"underlined":true}}'''
    if had_ability: return f'''{{"text":"{string}","color":"dark_gray","italic":false}}'''
    return f'''{{"text":"{string}","color":"dark_gray"}}'''

def pushLore(string, lore, had_ability):
    if len(string) > 0 and string[0] == '@' and len(lore) > 1: lore.append(n.TAG_String('{"text":" "}'))
    lore.append(n.TAG_String(loreLine(string, had_ability)))
    return had_ability or (len(string) > 0 and string[0] == '@')

def splitLore(string):
    lore = n.TAG_List([n.TAG_String('{"text":" "}')]);
    line = ""
    word = ""
    had_ability = False
    for i in range(len(string)):
        if string[i] != '\n' and string[i] != ' ': word += string[i]
        if string[i] == '\n' or i == len(string) - 1:
            if len(line) + len(word) + 1 <= 50:
                line += ' ' * (len(line) > 0) + word
                word = ""
                had_ability = pushLore(line, lore, had_ability)
                line = ""
                continue
            had_ability = pushLore(line, lore, had_ability)
            had_ability = pushLore(word, lore, had_ability)
            word = ""
            line = ""
            continue
        if string[i] == ' ':
            if len(line) + len(word) + 1 > 50:
                had_ability = pushLore(line, lore, had_ability)
                line = ""
            line += ' ' * (len(line) > 0) + word
            word = ""
            continue
    if len(word) > 0: lore.append(n.TAG_String(loreLine(word)))
    return lore

def randomUUID():
    return n.TAG_Int_Array(struct.unpack("iiii", random.randbytes(4*4)))

def fixFloatPrecision(f):
    f = round(f, 2)
    return str(int(f)) if f - round(f) == 0.0 else str(f)

def attributeLine(attr, sharp_lvl):
    display = attribute_display[str(attr['AttributeName'])]
    value = float(attr['Amount'])

    if str(attr['Slot']) == 'mainhand' and (str(attr['AttributeName']) == 'generic.attack_damage' or str(attr['AttributeName']) == 'generic.attack_speed'):
        if str(attr['AttributeName']) == 'generic.attack_damage':
            value += 1
            if sharp_lvl > 0:
                value += 1
                value += 0.5 * (sharp_lvl - 1)
        else: value += 4

        value = fixFloatPrecision(value * 100) + "%" if int(attr['Operation']) == 1 else fixFloatPrecision(value)
        return f'{{"text":" {value} {display}","color":"dark_green","italic":"false"}}'

    if int(attr['Operation']) == 1: value = fixFloatPrecision(value * 100) + "%"
    else:
        if (str(attr['AttributeName']) == 'generic.knockback_resistance'): value *= 10
        value = fixFloatPrecision(value)

    if float(attr['Amount']) > 0: return f'{{"text":"+{value} {display}","color":"blue","italic":"false"}}'
    if float(attr['Amount']) == 0: return f'["",{{"text":" ","bold":true}},{{"text":"0 {display}","color":"red","italic":"false"}}]'
    return f'{{"text":"{value} {display}","color":"red","italic":"false"}}'

def item_to_nbt(item, slot=None):
    item['name'] = item['name'].replace('"','\\"')
    nbt = {
        'id': n.TAG_String(item['item_id']),
        'Count': n.TAG_Byte(1),
        'tag': n.TAG_Compound({
            'display': n.TAG_Compound({
                'Name': n.TAG_String(f'''{{"text":"{item['name']}","color":"{item['name_color']}","bold":{item['name_bold']},"italic":false}}'''),
                'Lore': n.TAG_List([]),
            }),
            'Enchantments': n.TAG_List([]),
            'CustomEnchantments': n.TAG_List([]),
            'AttributeModifiers': n.TAG_List([]),
            'HideFlags': n.TAG_Int(65),
            'ItemIndex': n.TAG_Int(item['id']),
        }),
    }
    if slot != None: nbt['Slot'] = n.TAG_Byte(slot)
    if len(item['name']) < 1: nbt['tag']['display'].pop('Name')

    custom_nbt = n.from_snbt(f"{{{item['custom_nbt']}}}")
    merge_nbt(nbt['tag'], custom_nbt)

    if item['unbreakable']: nbt['tag']['Unbreakable'] = n.TAG_Byte(1)
    try: nbt['tag']['Damage'] = n.TAG_Int(item['durability'])
    except ValueError: pass
    try: nbt['tag']['CustomModelData'] = n.TAG_Int(item['model_data'])
    except ValueError: pass

    sharp_lvl = 0
    for ench in item['enchants']:
        ench_vanilla = (ench['id'] == 'infinity' and item['item_id'] == 'bow') or ench['id'] in vanilla_enchants
        nbt['tag']['Enchantments' if ench_vanilla else 'CustomEnchantments'].append(
            n.TAG_Compound({
                'id': n.TAG_String(("minecraft:" if ench_vanilla else "") + ench['id']),
                'lvl': n.TAG_Byte(ench['id'] in no_lvl_enchants or ench['lvl']),
            })
        )

        if ench['id'] == "quick_charge" and int(ench['lvl']) == 6:
            nbt['tag']['display']['Lore'].append(n.TAG_String('''{"text":"Can't Reload","color":"red","italic":false}'''))
            continue
        
        if ench['id'] == "curse_irreparability":
            nbt['tag']['RepairCost'] = n.TAG_Int(60)

        if ench['id'] == "sharpness":
            sharp_lvl = int(ench['lvl'])

        ench_display = enchant_display.get(ench['id'], ench['id'])
        ench_numeral = roman_numerals.get(int(ench['lvl']), ench['lvl'])
        ench_color = "red" if ench['id'] in cursed_enchants else "gray"
        nbt['tag']['display']['Lore'].append(n.TAG_String(
            f'''{{"text":"{ench_display}","color":"{ench_color}","italic":false}}''' 
            if ench['id'] in no_lvl_enchants else
            f'''{{"text":"{ench_display} {ench_numeral}","color":"{ench_color}","italic":false}}'''
        ))

    nbt['tag']['Enchantments'].append(n.TAG_Compound())
    if len(nbt['tag']['CustomEnchantments']) < 1:
        nbt['tag'].pop('CustomEnchantments')
        if len(nbt['tag']['Enchantments']) < 2:
            nbt['tag'].pop('Enchantments')
    
    if len(item['lore']) > 0:
        for l in splitLore(item['lore']):
            nbt['tag']['display']['Lore'].append(l)

    had = dict()
    for d in defaults: had[d] = False
    for attribute in item['attributes']:
        for d in defaults:
            had[d] |= attribute['type'] == defaults[d]['type'] and attribute['slot'] == defaults[d]['slot']

        nbt['tag']['AttributeModifiers'].append(n.TAG_Compound({
            'AttributeName': n.TAG_String('generic.' + attribute['type']),
            'Name': n.TAG_String('generic.' + attribute['type']),
            'Amount': n.TAG_Double(attribute['amount']),
            'Operation': n.TAG_Int(attribute['operation'] != 'amount'),
            'Slot': n.TAG_String(attribute['slot']),
            'UUID': randomUUID(),
        }))
    
    if len(nbt['tag']['AttributeModifiers']) < 1:
        nbt['tag'].pop('AttributeModifiers')
    else:
        nbt['tag']['HideFlags'] = n.TAG_Int(int(nbt['tag']['HideFlags']) + 2)
        
        for d in defaults:
            if not had[d] and item['item_id'] in defaults[d]['values']:
                nbt['tag']['AttributeModifiers'].append(n.TAG_Compound({
                    'AttributeName': n.TAG_String('generic.' + defaults[d]['type']),
                    'Name': n.TAG_String('generic.' + defaults[d]['type']),
                    'Amount': n.TAG_Double(defaults[d]['values'][item['item_id']]),
                    'Operation': n.TAG_Int(0),
                    'Slot': n.TAG_String(defaults[d]['slot']),
                    'UUID': randomUUID(),
                }))

        displayed_attrs = { "mainhand": [], "offhand": [], "head": [], "chest": [], "legs": [], "feet": [], }
        for attribute in nbt['tag']['AttributeModifiers']:
            line = attributeLine(attribute, sharp_lvl)
            if 'dark_green' in line: displayed_attrs[str(attribute['Slot'])].insert(int('Damage' not in line), line)
            else: displayed_attrs[str(attribute['Slot'])].append(line)
        for slot in displayed_attrs:
            if len(displayed_attrs[slot]) < 1: continue
            nbt['tag']['display']['Lore'].append(n.TAG_String('{"text":" "}'))
            nbt['tag']['display']['Lore'].append(n.TAG_String(f'{{"text":"{slot_display[slot]}","color":"gray","italic":false}}'))
            for attribute in displayed_attrs[slot]:
                nbt['tag']['display']['Lore'].append(n.TAG_String(attribute))

    if len(nbt['tag']['display']['Lore']) < 1: nbt['tag']['display'].pop('Lore')

    return n.TAG_Compound(nbt)

def main():
    print("\nItem Index placer script by Suso. Using amulet core.\n")

    if len(sys.argv) != 2:
        print("Usage: python {} <world>".format(sys.argv[0]))
        exit(0)

    if not query_yn("Have you made a backup of your world?"):
        exit(0)

    try: level = amulet.load_level(sys.argv[1])
    except Exception as e: print("Error loading world:", e)
    else:
        for item in ITEM_DATA:
            for location in item['locations']:
                if location['type'] == 'block':
                    try:
                        x, y, z = (int(location['x']), int(location['y']), int(location['z']))
                        cx, cz = coords_to_chunk(x, z)
                        item_nbt = item_to_nbt(item, location['slot'])
                        chunk = level.get_chunk(cx, cz, level.dimensions[0])
                        container = chunk.block_entities[(x,y,z)].nbt.tag
                    except Exception: print(item['creator'], item['name'], x, y, z)
                    else:
                        container['utags']['Items'] = n.TAG_List(
                            [it for it in container['utags']['Items'] if int(it['Slot']) != int(location['slot'])]
                            if 'Items' in container['utags']
                            else []
                        )
                        container['utags']['Items'].append(item_nbt)
                        chunk.changed = True
                else:
                    try:
                        x, y, z = (int(location['x']), int(location['y']), int(location['z']))
                        cx, cz = coords_to_chunk(x, z)
                        item_nbt = item_to_nbt(item)
                        entities = level.get_native_entities(cx, cz, level.dimensions[0])[0]
                    except Exception: print(item['creator'], item['name'], x, y, z)
                    else:
                        frame_entity = Entity("minecraft", "marker", float(x), float(y), float(z), n.TAG_Compound({
                            'UUID': randomUUID(),
                            'Tags': n.TAG_List([n.TAG_String("dies.registered"), n.TAG_String("dies.unloaded.glow_frame")]),
                            'data': n.TAG_Compound({
                                'Facing': n.TAG_Byte(location['facing']),
                                'Invisible': n.TAG_Byte(1),
                                'Tags': n.TAG_List([n.TAG_String("dies.registered"), n.TAG_String("dies.loaded.glow_frame")]),
                                'Item': item_nbt,
                            }),
                        }))
                        entities = EntityList([
                            e for e in entities
                            if distance(frame_entity.location, e.location) > 2.0 
                            or e.base_name not in ["item_frame","glow_item_frame"]
                        ])
                        entities.append(frame_entity)
                        level.set_native_entites(cx, cz, level.dimensions[0], entities)
        level.save()
        level.close()

if __name__ == '__main__':
    main()
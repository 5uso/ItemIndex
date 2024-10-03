let socket = null;
let username = "";
let unsaved_changes = false;
let filtering_user = false;

const escapeHtml = (unsafe) => {
    if (typeof unsafe === 'string' || unsafe instanceof String) return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
    else return unsafe;
}

const vanilla_enchants = [
    "protection", "fire_protection", "feather_falling", "blast_protection", "projectile_protection", "respiration", "aqua_affinity", "depth_strider", "frost_walker", "binding_curse", "sharpness", "smite", "bane_of_arthropods", "knockback", "fire_aspect", "looting", "sweeping", "efficiency", "silk_touch", "unbreaking", "fortune", "power", "punch", "flame", "luck_of_the_sea", "lure", "loyalty", "impaling", "riptide", "channeling", "mending", "vanishing_curse", "multishot", "piercing", "quick_charge", "soul_speed", "swift_sneak"
];

const no_lvl_enchants = [
    "aqua_affinity", "channeling", "binding_curse", "vanishing_curse", "flame", "infinity", "mending", "multishot", "silk_touch", "aquadynamic", "bleed", "cauterize", "fatigue_cleansing", "slowness_cleansing", "weakness_cleansing", "second_wind", "soulbound", "spurs", "electrode", "explosive", "expose", "frost", "flash", "fleetfoot", "infect", "trueshot", "auto_charge", "deadeye", "current", "hydraulic", "curse_encumbering", "curse_malevolance", "curse_shattering", "curse_two_handed", "curse_irreparability",
];

const cursed_enchants = [
    "binding_curse", "vanishing_curse", "curse_encumbering", "curse_malevolance", "curse_shattering", "curse_two_handed", "curse_regret", "curse_irreparability",
];

const roman_numerals = {
    0: "0", 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI", 7: "VII", 8: "VIII", 9: "IX", 10: "X",
};

const enchant_display = {
    "protection": "Protection", "fire_protection": "Fire Protection", "feather_falling": "Feather Falling", "blast_protection": "Blast Protection", "projectile_protection": "Projectile Protection", "respiration": "Respiration", "aqua_affinity": "Aqua Affinity", "depth_strider": "Depth Strider", "frost_walker": "Frost Walker", "binding_curse": "Curse of Binding", "sharpness": "Sharpness", "smite": "Smite", "bane_of_arthropods": "Bane of Arthropods", "knockback": "Knockback", "fire_aspect": "Fire Aspect", "looting": "Looting", "sweeping": "Sweeping Edge", "efficiency": "Efficiency", "silk_touch": "Silk Touch", "unbreaking": "Unbreaking", "fortune": "Fortune", "power": "Power", "punch": "Punch", "flame": "Flame", "infinity": "Infinity", "luck_of_the_sea": "Luck of the Sea", "lure": "Lure", "loyalty": "Loyalty", "impaling": "Impaling", "riptide": "Riptide", "channeling": "Channeling", "mending": "Mending", "vanishing_curse": "Curse of Vanishing", "multishot": "Multishot", "piercing": "Piercing", "quick_charge": "Quick Charge", "soul_speed": "Soul Speed", "swift_sneak": "Swift Sneak", "thorns": "Thorns", "adrenaline": "Adrenaline", "agility": "Agility", "aquadynamic": "Aquadynamic", "cauterize": "Cauterize", "concealed": "Concealed", "fatigue_cleansing": "Fatigue Cleansing", "slowness_cleansing": "Slowness Cleansing", "weakness_cleansing": "Weakness Cleansing", "poison_cleansing": "Poison Cleansing", "wither_cleansing": "Wither Cleansing", "energetic": "Energetic", "evasion": "Evasion", "frenzy": "Frenzy", "lifesteal": "Lifesteal", "rally": "Rally", "regeneration": "Regeneration", "satiation": "Satiation", "second_wind": "Second Wind", "spurs": "Spurs", "bleeding": "Bleeding", "duelist": "Duelist", "echo": "Echo", "electrocute": "Electrocute", "evocation": "Evocation", "executioner": "Executioner", "exposing": "Exposing", "first_strike": "First Strike", "frostbite": "Frostbite", "hunter": "Hunter", "infection": "Infection", "singe": "Singe", "stunning": "Stunning", "surging_strike": "Surging Strike", "transfiguration": "Transfiguration", "bleed": "Bleed", "electrode": "Electrode", "explosive": "Explosive", "expose": "Expose", "frost": "Frost", "flash": "Flash", "fleetfoot": "Fleetfoot", "infect": "Infect", "point_blank": "Point Blank", "overcharge": "Overcharge", "sharpshot": "Sharpshot", "tempo_theft": "Tempo Theft", "trueshot": "Trueshot", "auto_charge": "Auto Charge", "deadeye": "Deadeye", "repeating": "Repeating", "current": "Current", "hydraulic": "Hydraulic", "ricochet": "Ricochet", "tempest": "Tempest", "eruption": "Eruption", "sapper": "Sapper", "soulbound": "Soulbound", "curse_encumbering": "Curse of Encumbering", "curse_malevolance": "Curse of Malevolance", "curse_regret": "Curse of Regret", "curse_shattering": "Curse of Shattering", "curse_two_handed": "Two Handed", "curse_irreparability": "Curse of Irreparability",
};

const attribute_display = {
    "generic.max_health": "Max Health", "generic.knockback_resistance": "Knockback Resistance", "generic.movement_speed": "Speed", "generic.attack_damage": "Attack Damage", "generic.armor": "Armor", "generic.armor_toughness": "Armor Toughness", "generic.attack_speed": "Attack Speed",
}

const slot_display = {
    "mainhand": "When in Main Hand:", "offhand": "When in Off Hand:", "feet": "When on Feet:", "legs": "When on Legs:", "chest": "When on Body:", "head": "When on Head:",
};

const default_dmg = {
    "wooden_sword": 3, "stone_sword": 4, "golden_sword": 3, "iron_sword": 5, "diamond_sword": 6, "netherite_sword": 7, "trident": 8,
    "wooden_shovel": 1.5, "wooden_pickaxe": 1, "wooden_axe": 6, "wooden_hoe": 0,
    "stone_shovel": 2.5, "stone_pickaxe": 2, "stone_axe": 8, "stone_hoe": 0,
    "golden_shovel": 1.5, "golden_pickaxe": 1, "golden_axe": 6, "golden_hoe": 0,
    "iron_shovel": 3.5, "iron_pickaxe": 3, "iron_axe": 8, "iron_hoe": 0,
    "diamond_shovel": 4.5, "diamond_pickaxe": 4, "diamond_axe": 8, "diamond_hoe": 0,
    "netherite_shovel": 5.5, "netherite_pickaxe": 5, "netherite_axe": 9, "netherite_hoe": 0,
};

const default_spd = {
    "wooden_sword": -2.4, "stone_sword": -2.4, "golden_sword": -2.4, "iron_sword": -2.4, "diamond_sword": -2.4, "netherite_sword": -2.4, "trident": -2.9,
    "wooden_shovel": -3, "wooden_pickaxe": -2.8, "wooden_axe": -3.2, "wooden_hoe": -3,
    "stone_shovel": -3, "stone_pickaxe": -2.8, "stone_axe": -3.2, "stone_hoe": -2,
    "golden_shovel": -3, "golden_pickaxe": -2.8, "golden_axe": -3, "golden_hoe": -3,
    "iron_shovel": -3, "iron_pickaxe": -2.8, "iron_axe": -3.1, "iron_hoe": -1,
    "diamond_shovel": -3, "diamond_pickaxe": -2.8, "diamond_axe": -3, "diamond_hoe": 0,
    "netherite_shovel": -3, "netherite_pickaxe": -2.8, "netherite_axe": -3, "netherite_hoe": 0,
};

const default_helm = {
    "leather_helmet": 1, "chainmail_helmet": 2, "iron_helmet": 2, "diamond_helmet": 3, "golden_helmet": 2, "netherite_helmet": 3, "turtle_helmet": 2,
};

const default_ches = {
    "leather_chestplate": 3, "chainmail_chestplate": 5, "iron_chestplate": 6, "diamond_chestplate": 8, "golden_chestplate": 5, "netherite_chestplate": 8,
};

const default_pant = {
    "leather_leggings": 2, "chainmail_leggings": 4, "iron_leggings": 5, "diamond_leggings": 6, "golden_leggings": 3, "netherite_leggings": 6,
};

const default_boot = {
    "leather_boots": 1, "chainmail_boots": 1, "iron_boots": 2, "diamond_boots": 3, "golden_boots": 1, "netherite_boots": 3,
};

const default_helm_t = {
    "diamond_helmet": 2, "netherite_helmet": 3,
};

const default_ches_t = {
    "diamond_chestplate": 2, "netherite_chestplate": 3,
};

const default_pant_t = {
    "diamond_leggings": 2, "netherite_leggings": 3,
};

const default_boot_t = {
    "diamond_boots": 2, "netherite_boots": 3,
};

const default_helm_k = {
    "netherite_helmet": 0.1,
};

const default_ches_k = {
    "netherite_chestplate": 0.1,
};

const default_pant_k = {
    "netherite_leggings": 0.1,
};

const default_boot_k = {
    "netherite_boots": 0.1,
};

function isItemOpen() {
    return document.getElementById("item_form").style.display === "inline-block";
}

function flag_unsaved() {
    unsaved_changes = true;
}

let total_enchants = 0;
function removeEnchant(enchant_num) {
    enchant_num = parseInt(enchant_num);
    document.getElementById(`enchant${enchant_num}`).remove();
    for (let i = enchant_num + 1; i <= total_enchants; i++) {
        document.getElementById(`enchant${i}`).setAttribute("num", `${i - 1}`);
        document.getElementById(`enchant${i}`).id = `enchant${i - 1}`;
        document.getElementById(`enchant${i}.id`).id = `enchant${i - 1}.id`;
        document.getElementById(`enchant${i}.lvl`).id = `enchant${i - 1}.lvl`;
    }
    total_enchants--;
    flag_unsaved();
}

function addEnchant_load(id, lvl) {
    total_enchants++;
    let base = `<br>
                <input list="enchant_id_list" value="${id}" id="enchant${total_enchants}.id">
                <input type="number" value="${lvl}" min="1" max="255" id="enchant${total_enchants}.lvl">
                <input type="button" style="font-size: 12px;" value="x" onclick="removeEnchant(this.parentNode.getAttribute('num'))">
                `;
    let new_enchant = document.createElement('div');
    new_enchant.id = `enchant${total_enchants}`;
    new_enchant.setAttribute("num", `${total_enchants}`);
    new_enchant.innerHTML = base;
    document.getElementById("enchant_list").appendChild(new_enchant);
}

function addEnchant() {
    addEnchant_load("", 1);
    flag_unsaved();
}

let total_attributes = 0;
function removeAttributeM(attribute_num) {
    attribute_num = parseInt(attribute_num);
    document.getElementById(`attribute${attribute_num}`).remove();
    for (let i = attribute_num + 1; i <= total_attributes; i++) {
        document.getElementById(`attribute${i}`).setAttribute("num", `${i - 1}`);
        document.getElementById(`attribute${i}`).id = `attribute${i - 1}`;
        document.getElementById(`attribute${i}.type`).id = `attribute${i - 1}.type`;
        document.getElementById(`attribute${i}.slot`).id = `attribute${i - 1}.slot`;
        document.getElementById(`attribute${i}.operation`).id = `attribute${i - 1}.operation`;
        document.getElementById(`attribute${i}.amount`).id = `attribute${i - 1}.amount`;
    }
    total_attributes--;
    flag_unsaved();
}

function addAttributeM_load(type, slot, operation, amount) {
    total_attributes++;
    let base = `<br>
                <select id="attribute${total_attributes}.type">
                    <option value="max_health">max_health</option>
                    <option value="knockback_resistance">knockback_resistance</option>
                    <option value="movement_speed">movement_speed</option>
                    <option value="attack_damage">attack_damage</option>
                    <option value="armor">armor</option>
                    <option value="armor_toughness">armor_toughness</option>
                    <option value="attack_speed">attack_speed</option>
                </select>
                <select id="attribute${total_attributes}.slot">
                    <option value="mainhand">mainhand</option>
                    <option value="offhand">offhand</option>
                    <option value="feet">feet</option>
                    <option value="legs">legs</option>
                    <option value="chest">chest</option>
                    <option value="head">head</option>
                </select>
                <input type="button" style="font-size: 12px;" value="x" onclick="removeAttributeM(this.parentNode.getAttribute('num'))"><br>
                <select id="attribute${total_attributes}.operation">
                    <option value="amount">amount</option>
                    <option value="percentage">percentage</option>
                </select>
                <input type="number" id="attribute${total_attributes}.amount">
                `;
    let new_attribute = document.createElement('div');
    new_attribute.id = `attribute${total_attributes}`;
    new_attribute.setAttribute("num", `${total_attributes}`);
    new_attribute.innerHTML = base;
    document.getElementById("attribute_list").appendChild(new_attribute);

    document.getElementById(`attribute${total_attributes}.type`).value = type;
    document.getElementById(`attribute${total_attributes}.slot`).value = slot;
    document.getElementById(`attribute${total_attributes}.operation`).value = operation;
    document.getElementById(`attribute${total_attributes}.amount`).value = amount;
}

function addAttributeM() {
    addAttributeM_load("max_health", "mainhand", "amount", "1");
    flag_unsaved();
}

let total_locations = 0;
function removeLocation(location_num) {
    location_num = parseInt(location_num);
    document.getElementById(`location${location_num}`).remove();
    for (let i = location_num + 1; i <= total_locations; i++) {
        document.getElementById(`location${i}`).setAttribute("num", `${i - 1}`);
        document.getElementById(`location${i}`).id = `location${i - 1}`;
        document.getElementById(`location${i}.type`).id = `location${i - 1}.type`;
        document.getElementById(`location${i}.x`).id = `location${i - 1}.x`;
        document.getElementById(`location${i}.y`).id = `location${i - 1}.y`;
        document.getElementById(`location${i}.z`).id = `location${i - 1}.z`;
        document.getElementById(`location${i}.slot`).id = `location${i - 1}.slot`;
        document.getElementById(`location${i}.facing`).id = `location${i - 1}.facing`;
    }
    total_locations--;
    flag_unsaved();
}

function adjustLocationFields(location_num, value) {
    if (value === "item_frame") {
        document.getElementById(`location${location_num}.slot`).style.display = "none";
        document.getElementById(`location${location_num}.facing`).style.display = "inline-block";
        document.getElementById(`location${location_num}.change_label`).innerHTML = "Facing";
        return;
    }

    document.getElementById(`location${location_num}.slot`).style.display = "inline-block";
    document.getElementById(`location${location_num}.facing`).style.display = "none";
    document.getElementById(`location${location_num}.change_label`).innerHTML = "Slot";
}

function addLocation_load(type, x, y, z, slot, facing) {
    total_locations++;
    let base = `<br>
                <select id="location${total_locations}.type" onchange="adjustLocationFields(this.parentNode.getAttribute('num'), this.value)">
                    <option value="block">block</option>
                    <option value="item_frame">item_frame</option>
                </select>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <label>X</label>
                <input type="number" value="${x}" min="-9999" max="9999" id="location${total_locations}.x">
                <label>Y</label>
                <input type="number" value="${y}" min="0" max="320" id="location${total_locations}.y">
                <label>Z</label>
                <input type="number" value="${z}" min="-9999" max="9999" id="location${total_locations}.z">
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <label id="location${total_locations}.change_label">${type === "item_frame" ? "Facing" : "Slot"}</label>
                <input type="number" value="${slot}" min="0" max="26" id="location${total_locations}.slot" style="display: ${type === "item_frame" ? "none" : "inline-block"};">
                <select id="location${total_locations}.facing" style="display: ${type === "item_frame" ? "inline-block" : "none"};">
                    <option value="0">Down</option>
                    <option value="1">Up</option>
                    <option value="2">North</option>
                    <option value="3">South</option>
                    <option value="4">West</option>
                    <option value="5">East</option>
                </select>
                <input type="button" style="font-size: 12px;" value="x" onclick="removeLocation(this.parentNode.getAttribute('num'))" class="location_button">
                `;
    let new_location = document.createElement('div');
    new_location.id = `location${total_locations}`;
    new_location.setAttribute("num", `${total_locations}`);
    new_location.innerHTML = base;
    document.getElementById("location_list").appendChild(new_location);

    document.getElementById(`location${total_locations}.type`).value = type;
    document.getElementById(`location${total_locations}.facing`).value = facing;
}

function addLocation() {
    addLocation_load("block", "", "", "", "", "1");
    flag_unsaved();
}

function requestDeleteItem(id) {
    let name = document.getElementById(`item${id}`).querySelector('.item_entry_name').textContent;
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    socket.send(`{"type":"delete_item","id":"${id}"}`);
}

function requestNewItem() {
    socket.send('{"type":"new_item"}');
}

function requestLoadItem(id) {
    let name = document.getElementById(`item_name`).value;
    if (unsaved_changes && !confirm(`Discard changes to ${name}?`)) return;

    socket.send(`{"type":"load_item","id":"${id}"}`);
}

function requestUpdateItem() {
    let enchant_list = [];
    for (let i = 1; i <= total_enchants; i++) {
        enchant_list.push({
            'id': document.getElementById(`enchant${i}.id`).value,
            'lvl': document.getElementById(`enchant${i}.lvl`).value,
        });
    }

    let attribute_list = [];
    for (let i = 1; i <= total_attributes; i++) {
        attribute_list.push({
            'type': document.getElementById(`attribute${i}.type`).value,
            'slot': document.getElementById(`attribute${i}.slot`).value,
            'operation': document.getElementById(`attribute${i}.operation`).value,
            'amount': document.getElementById(`attribute${i}.amount`).value,
        });
    }

    let location_list = [];
    for (let i = 1; i <= total_locations; i++) {
        let loc = {
            'type': document.getElementById(`location${i}.type`).value,
            'x': document.getElementById(`location${i}.x`).value,
            'y': document.getElementById(`location${i}.y`).value,
            'z': document.getElementById(`location${i}.z`).value,
        };

        if (loc['type'] === 'item_frame') {
            loc['facing'] = document.getElementById(`location${i}.facing`).value;
        } else {
            loc['slot'] = document.getElementById(`location${i}.slot`).value;
        }

        location_list.push(loc);
    }

    let data = JSON.stringify({
        'type': 'update_item',
        'item': {
            'id': document.getElementById("identifier").value,
            'name': document.getElementById("item_name").value,
            'name_color': document.getElementById("name_color").value,
            'name_bold': document.getElementById("name_bold").checked,
            'item_id': document.getElementById("item_id").value,
            'durability': document.getElementById("durability").value,
            'unbreakable': document.getElementById("unbreakable").checked,
            'model_data': document.getElementById("custom_model").value,
            'custom_nbt': document.getElementById("custom_nbt").value,
            'lore': document.getElementById("lore").value,
            'enchants': enchant_list,
            'attributes': attribute_list,
            'locations': location_list,
            'area_tier': document.getElementById("area_tier").value,
        },
    });
    socket.send(data);
    unsaved_changes = false;
}

function removeItem(item_num, user) {
    document.getElementById(`item${item_num}`).remove();
    if (isItemOpen() && parseInt(document.getElementById("identifier").value) == item_num) {
        boopItem();
        alert(`${user} has deleted the item you were editing`);
    }
}

function boopItem() {
    unsaved_changes = false;
    document.getElementById("item_form").style.display = "none";
}

function addItem(item) {
    let id_displayed = escapeHtml(item['id']);
    let item_displayed = escapeHtml(item['item_id']);
    let name_displayed = item['name_bold'] ? "<b>" + escapeHtml(item['name']) + "</b>" : escapeHtml(item['name']);
    let color_displayed = escapeHtml(item['name_color']);
    let creator_displayed = escapeHtml(item['creator']);
    let tier_displayed;
    switch (parseInt(item['area_tier'])) {
        default:
        case 0: tier_displayed = '<div style="color: #166301;">Starting Area</div>'; break;
        case 1: tier_displayed = '<div style="color: #000d9e;">Tier 1</div>'; break;
        case 2: tier_displayed = '<div style="color: #7c8c00;">Tier 2</div>'; break;
        case 3: tier_displayed = '<div style="color: #8c0000;">Tier 3</div>'; break;
        case 4: tier_displayed = '<div style="color: #5300b8;">Final Area</div>'; break;
    }

    let base = `<input class="item_entry_remove" type="button" style="font-size: 12px;" value="x" onclick="requestDeleteItem(${id_displayed}); event.stopPropagation();">
                <img src="textures/${item_displayed}.png" class="item_entry_img" onerror="if(this.src != 'textures/not_found.png') this.src = 'textures/not_found.png';"}>
                <a class="item_entry_name" style="color: ${color_displayed};">${name_displayed}</a>
                <br><a class="item_entry_creator">${creator_displayed}</a>
                <a class="item_entry_tier">${tier_displayed}</a>
                `;

    let new_item = document.createElement('div');
    new_item.id = `item${item.id}`;
    new_item.setAttribute("num", `${item.id}`);
    new_item.classList.add("item_entry");
    new_item.innerHTML = base;
    new_item.onclick = () => requestLoadItem(item['id']);
    new_item.style.display = (filtering_user && item['creator'] !== username) ? "none" : "block";
    document.getElementById("item_list").appendChild(new_item);
}

function loadItem(item) {
    document.getElementById("identifier").value = item['id'];

    document.getElementById("item_name").value = item['name'];
    document.getElementById("name_color").value = item['name_color'];
    document.getElementById("name_bold").checked = item['name_bold'];

    document.getElementById("item_id").value = item['item_id'];
    document.getElementById("item_id").onchange();

    document.getElementById("durability").value = item['durability'];
    document.getElementById("unbreakable").checked = item['unbreakable'];
    document.getElementById("custom_model").value = item['model_data'];
    document.getElementById("custom_nbt").value = item['custom_nbt'];
    document.getElementById("lore").value = item['lore'];

    total_enchants = 0;
    document.getElementById("enchant_list").innerHTML = "";
    item['enchants'].forEach(ench => addEnchant_load(ench['id'], ench['lvl']));

    total_attributes = 0;
    document.getElementById("attribute_list").innerHTML = "";
    item['attributes'].forEach(attr => addAttributeM_load(attr['type'], attr['slot'], attr['operation'], attr['amount']));

    total_locations = 0;
    document.getElementById("location_list").innerHTML = "";
    item['locations'].forEach(loc => addLocation_load(loc['type'], loc['x'], loc['y'], loc['z'], loc['type'] === 'block' ? loc['slot'] : "", loc['type'] === 'item_frame' ? loc['facing'] : "1"));

    document.getElementById("area_tier").value = item['area_tier'];

    document.getElementById("item_form").style.display = "inline-block";

    unsaved_changes = false;
}

function updateItem(item) {
    let id_displayed = escapeHtml(item['id']);
    let item_displayed = escapeHtml(item['item_id']);
    let name_displayed = item['name_bold'] ? "<b>" + escapeHtml(item['name']) + "</b>" : escapeHtml(item['name']);
    let color_displayed = escapeHtml(item['name_color']);
    let creator_displayed = escapeHtml(item['creator']);
    let tier_displayed;
    switch (parseInt(item['area_tier'])) {
        default:
        case 0: tier_displayed = '<div style="color: #166301;">Starting Area</div>'; break;
        case 1: tier_displayed = '<div style="color: #000d9e;">Tier 1</div>'; break;
        case 2: tier_displayed = '<div style="color: #7c8c00;">Tier 2</div>'; break;
        case 3: tier_displayed = '<div style="color: #8c0000;">Tier 3</div>'; break;
        case 4: tier_displayed = '<div style="color: #5300b8;">Final Area</div>'; break;
    }

    let base = `<input class="item_entry_remove" type="button" style="font-size: 12px;" value="x" onclick="requestDeleteItem(${id_displayed}); event.stopPropagation();">
                <img src="textures/${item_displayed}.png" class="item_entry_img" onerror="if(this.src != 'textures/not_found.png') this.src = 'textures/not_found.png';">
                <a class="item_entry_name" style="color: ${color_displayed};">${name_displayed}</a>
                <br><a class="item_entry_creator">${creator_displayed}</a>
                <a class="item_entry_tier">${tier_displayed}</a>
                `;

    let id = item['id'];
    document.getElementById(`item${id}`).innerHTML = base;

    if (isItemOpen() && parseInt(document.getElementById("identifier").value) == item['id']) {
        requestLoadItem(item['id']);
    }
}

//Horrible, but I can't set up https right now (I have now set up https, but I'm leaving it this way in case I need to test stuff without ssl)
function copyToClipboard(textToCopy) {
    let textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((res, rej) => {
        document.execCommand('copy') ? res() : rej();
        textArea.remove();
    });
}

function escapeGiveQuotes(str) {
    str = str.replaceAll("'", "’");
    return str;
}

function loreLine(str, had_ability) {
    if (str[0] == '@') return `{'text':'${str.substr(1)}','color':'gray','italic':false,'underlined':true}`;
    if (had_ability) return `{'text':'${str}','color':'dark_gray','italic':false}`;
    return `{'text':'${str}','color':'dark_gray'}`;
}

function pushLore(str, lore, had_ability) {
    if (str[0] == '@' && lore.length > 1) lore.push("{'text':' '}");
    lore.push(loreLine(str, had_ability));
    return had_ability || str[0] == '@';
}

function splitLore(str) {
    let lore = ["{'text':' '}"];
    let line = "";
    let word = "";
    let had_ability = false;
    str = escapeGiveQuotes(str);

    for (let i = 0; i < str.length; i++) {
        if (str[i] != '\n' && str[i] != ' ') word += str[i];

        if (str[i] == '\n' || i == str.length - 1) {
            if (line.length + word.length + 1 <= 50) {
                line = line + (line.length > 0 ? ' ' : '') + word;
                word = "";
                had_ability = pushLore(line, lore, had_ability);
                line = "";
                continue;
            }

            had_ability = pushLore(line, lore, had_ability);
            had_ability = pushLore(word, lore, had_ability);
            word = "";
            line = "";
            continue;
        }

        if (str[i] == ' ') {
            if (line.length + word.length + 1 > 50) {
                had_ability = pushLore(line, lore, had_ability);
                line = "";
            }
            line = line + (line.length > 0 ? ' ' : '') + word;
            word = "";
            continue;
        }
    }

    if (word.length > 0) lore.push(loreLine(word));
    return lore;
}

function fixFloatPrecision(f) {
    return parseFloat(f.toFixed(2));
}

function attributeLine(attr, sharp_lvl) {
    let display = attribute_display[attr['AttributeName']];
    let value = attr['Amount'];

    if (attr['Slot'] === 'mainhand' && (attr['AttributeName'] === 'generic.attack_damage' || attr['AttributeName'] === 'generic.attack_speed')) {
        if (attr['AttributeName'] === 'generic.attack_damage') {
            value += 1;
            if (sharp_lvl > 0) {
                value += 1;
                value += 0.5 * (sharp_lvl - 1);
            }
        } else value += 4;

        if (attr['Operation'] == 1) value = value * 100 + "%";
        value = fixFloatPrecision(value);
        return `{'text':' ${value} ${display}','color':'dark_green','italic':'false'}`;
    }

    if (attr['Operation'] == 1) value = fixFloatPrecision(value * 100) + "%";
    else {
        if (attr['AttributeName'] === 'generic.knockback_resistance') value *= 10;
        value = fixFloatPrecision(value);
    }

    if (attr['Amount'] > 0) return `{'text':'+${value} ${display}','color':'blue','italic':'false'}`;
    if (attr['Amount'] == 0) return `['',{'text':' ','bold':true},{'text':'0 ${display}','color':'red','italic':'false'}]`;
    return `{'text':'${value} ${display}','color':'red','italic':'false'}`;
}

function randomInt() {
    return Math.floor(Math.random() * 2147483646) - 1073741823;
}

function randomUUID() {
    return `[I;${randomInt()},${randomInt()},${randomInt()},${randomInt()}]`;
}

function giveJsonFormat(json) {
    json = json.replaceAll("'", "\uFFFF");
    json = json.replaceAll('"', "'");
    json = json.replaceAll(/\uFFFF/g, '"');
    json = json.replaceAll("\\'", '\\\\"');
    json = json.replaceAll("æ", ".");;

    while (json.includes('%RANDOM_UUID%')) json = json.replace("'%RANDOM_UUID%'", randomUUID());

    return json;
}

function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

function mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
}

function copyItem() {
    let item_id = document.getElementById("item_id").value;

    let item_name = escapeGiveQuotes(document.getElementById("item_name").value);
    let name_color = document.getElementById("name_color").value;
    let name_bold = document.getElementById("name_bold").checked;
    let damage = parseInt(document.getElementById("durability").value);
    let unbreakable = document.getElementById("unbreakable").checked;
    let custom_model = parseInt(document.getElementById("custom_model").value);
    let custom_nbt = document.getElementById("custom_nbt").value;
    let lore = document.getElementById("lore").value;
    let identifier = parseInt(document.getElementById("identifier").value);

    let tags = {
        'display': {
            'Name': `{'text':'${item_name}','color':'${name_color}','bold':${name_bold},'italic':false}`,
            'Lore': [],
        },
        'Enchantments': [],
        'CustomEnchantments': [],
        'AttributeModifiers': [],
        'HideFlags': 65,
        'ItemIndex': identifier,
    };
    if (item_name.length == 0) delete tags['display']['Name'];

    //Wow this is bad
    custom_nbt = custom_nbt.replaceAll(/([0-9]+)b/g, '$1').replaceAll(".", "æ");
    let custom_nbt_obj = {};
    try {
        custom_nbt_obj = eval("a = {" + custom_nbt.replaceAll('(', '').replaceAll(')', '').replaceAll(';', '') + "};");
    } catch (e) {
        alert("Couldn't copy item. Check your Custom Tags for errors");
    }
    tags = mergeDeep(tags, custom_nbt_obj);

    if (!isNaN(damage)) tags['Damage'] = damage;
    if (unbreakable) tags['Unbreakable'] = true;
    if (!isNaN(custom_model)) tags['CustomModelData'] = custom_model;

    let sharp_lvl = 0;
    for (let i = 1; i <= total_enchants; i++) {
        let ench_id = document.getElementById(`enchant${i}.id`).value;
        let ench_lvl = parseInt(document.getElementById(`enchant${i}.lvl`).value);

        let ench_vanilla = (ench_id === 'infinity' && item_id === 'bow') || vanilla_enchants.includes(ench_id);
        tags[ench_vanilla ? 'Enchantments' : 'CustomEnchantments'].push({
            'id': (ench_vanilla ? "minecraft:" : "") + ench_id,
            'lvl': no_lvl_enchants.includes(ench_id) ? true : ench_lvl,
        });

        if (ench_id === "quick_charge" && ench_lvl == 6) {
            tags['display']['Lore'].push(`{'text':'Can’t Reload','color':'red','italic':false}`);
            continue;
        }

        if (ench_id === "curse_irreparability") {
            tags['RepairCost'] = 60;
        }

        let ench_display = enchant_display[ench_id] || ench_id;
        let ench_numeral = roman_numerals[ench_lvl] || ench_lvl;
        let ench_color = cursed_enchants.includes(ench_id) ? "red" : "gray";
        tags['display']['Lore'].push(no_lvl_enchants.includes(ench_id) ?
            `{'text':'${ench_display}','color':'${ench_color}','italic':false}` :
            `{'text':'${ench_display} ${ench_numeral}','color':'${ench_color}','italic':false}`);

        if (ench_id === 'sharpness') sharp_lvl = ench_lvl;
    }
    tags['Enchantments'].push({});
    if (tags['CustomEnchantments'].length == 0) {
        delete tags['CustomEnchantments'];
        if (tags['Enchantments'].length == 1) delete tags['Enchantments'];
    }

    if (lore.length > 0) splitLore(lore).forEach((line) => tags['display']['Lore'].push(line));

    let has_dmg = false;
    let has_spd = false;
    let has_helm = false;
    let has_ches = false;
    let has_pant = false;
    let has_boot = false;
    let has_helm_t = false;
    let has_ches_t = false;
    let has_pant_t = false;
    let has_boot_t = false;
    let has_helm_k = false;
    let has_ches_k = false;
    let has_pant_k = false;
    let has_boot_k = false;
    for (let i = 1; i <= total_attributes; i++) {
        let type = document.getElementById(`attribute${i}.type`).value;
        let slot = document.getElementById(`attribute${i}.slot`).value;
        let operation = document.getElementById(`attribute${i}.operation`).value;
        let amount = document.getElementById(`attribute${i}.amount`).value;

        has_dmg |= type === 'attack_damage' && slot === 'mainhand';
        has_spd |= type === 'attack_speed' && slot === 'mainhand';
        has_helm |= type === 'armor' && slot === 'head';
        has_ches |= type === 'armor' && slot === 'chest';
        has_pant |= type === 'armor' && slot === 'legs';
        has_boot |= type === 'armor' && slot === 'feet';
        has_helm_t |= type === 'armor_toughness' && slot === 'head';
        has_ches_t |= type === 'armor_toughness' && slot === 'chest';
        has_pant_t |= type === 'armor_toughness' && slot === 'legs';
        has_boot_t |= type === 'armor_toughness' && slot === 'feet';
        has_helm_k |= type === 'knockback_resistance' && slot === 'head';
        has_ches_k |= type === 'knockback_resistance' && slot === 'chest';
        has_pant_k |= type === 'knockback_resistance' && slot === 'legs';
        has_boot_k |= type === 'knockback_resistance' && slot === 'feet';

        tags['AttributeModifiers'].push({
            'AttributeName': 'generic.' + type,
            'Name': 'generic.' + type,
            'Amount': +amount,
            'Operation': operation === 'amount' ? 0 : 1,
            'Slot': slot,
            'UUID': '%RANDOM_UUID%',
        });
    }
    if (tags['AttributeModifiers'].length == 0) {
        delete tags['AttributeModifiers'];
    } else {
        tags['HideFlags'] += 2;

        // Better data structuring would get rid of this mess, but I'm speedrunning at this point so fuck it
        { //At least I'll add some braces so I don't have to look at it again
            if (!has_dmg && item_id in default_dmg) {
                tags['AttributeModifiers'].push({
                    'AttributeName': 'generic.attack_damage',
                    'Name': 'generic.attack_damage',
                    'Amount': default_dmg[item_id],
                    'Operation': 0,
                    'Slot': 'mainhand',
                    'UUID': '%RANDOM_UUID%',
                });
            }
            if (!has_spd && item_id in default_spd) {
                tags['AttributeModifiers'].push({
                    'AttributeName': 'generic.attack_speed',
                    'Name': 'generic.attack_speed',
                    'Amount': default_spd[item_id],
                    'Operation': 0,
                    'Slot': 'mainhand',
                    'UUID': '%RANDOM_UUID%',
                });
            }
            if (!has_helm && item_id in default_helm) {
                tags['AttributeModifiers'].push({
                    'AttributeName': 'generic.armor',
                    'Name': 'generic.armor',
                    'Amount': default_helm[item_id],
                    'Operation': 0,
                    'Slot': 'head',
                    'UUID': '%RANDOM_UUID%',
                });
            }
            if (!has_ches && item_id in default_ches) {
                tags['AttributeModifiers'].push({
                    'AttributeName': 'generic.armor',
                    'Name': 'generic.armor',
                    'Amount': default_ches[item_id],
                    'Operation': 0,
                    'Slot': 'chest',
                    'UUID': '%RANDOM_UUID%',
                });
            }
            if (!has_pant && item_id in default_pant) {
                tags['AttributeModifiers'].push({
                    'AttributeName': 'generic.armor',
                    'Name': 'generic.armor',
                    'Amount': default_pant[item_id],
                    'Operation': 0,
                    'Slot': 'legs',
                    'UUID': '%RANDOM_UUID%',
                });
            }
            if (!has_boot && item_id in default_boot) {
                tags['AttributeModifiers'].push({
                    'AttributeName': 'generic.armor',
                    'Name': 'generic.armor',
                    'Amount': default_boot[item_id],
                    'Operation': 0,
                    'Slot': 'feet',
                    'UUID': '%RANDOM_UUID%',
                });
            }
            if (!has_helm_t && item_id in default_helm_t) {
                tags['AttributeModifiers'].push({
                    'AttributeName': 'generic.armor_toughness',
                    'Name': 'generic.armor_toughness',
                    'Amount': default_helm_t[item_id],
                    'Operation': 0,
                    'Slot': 'head',
                    'UUID': '%RANDOM_UUID%',
                });
            }
            if (!has_ches_t && item_id in default_ches_t) {
                tags['AttributeModifiers'].push({
                    'AttributeName': 'generic.armor_toughness',
                    'Name': 'generic.armor_toughness',
                    'Amount': default_ches_t[item_id],
                    'Operation': 0,
                    'Slot': 'chest',
                    'UUID': '%RANDOM_UUID%',
                });
            }
            if (!has_pant_t && item_id in default_pant_t) {
                tags['AttributeModifiers'].push({
                    'AttributeName': 'generic.armor_toughness',
                    'Name': 'generic.armor_toughness',
                    'Amount': default_pant_t[item_id],
                    'Operation': 0,
                    'Slot': 'legs',
                    'UUID': '%RANDOM_UUID%',
                });
            }
            if (!has_boot_t && item_id in default_boot_t) {
                tags['AttributeModifiers'].push({
                    'AttributeName': 'generic.armor_toughness',
                    'Name': 'generic.armor_toughness',
                    'Amount': default_boot_t[item_id],
                    'Operation': 0,
                    'Slot': 'feet',
                    'UUID': '%RANDOM_UUID%',
                });
            }
            if (!has_helm_k && item_id in default_helm_k) {
                tags['AttributeModifiers'].push({
                    'AttributeName': 'generic.knockback_resistance',
                    'Name': 'generic.knockback_resistance',
                    'Amount': default_helm_k[item_id],
                    'Operation': 0,
                    'Slot': 'head',
                    'UUID': '%RANDOM_UUID%',
                });
            }
            if (!has_ches_k && item_id in default_ches_k) {
                tags['AttributeModifiers'].push({
                    'AttributeName': 'generic.knockback_resistance',
                    'Name': 'generic.knockback_resistance',
                    'Amount': default_ches_k[item_id],
                    'Operation': 0,
                    'Slot': 'chest',
                    'UUID': '%RANDOM_UUID%',
                });
            }
            if (!has_pant_k && item_id in default_pant_k) {
                tags['AttributeModifiers'].push({
                    'AttributeName': 'generic.knockback_resistance',
                    'Name': 'generic.knockback_resistance',
                    'Amount': default_pant_k[item_id],
                    'Operation': 0,
                    'Slot': 'legs',
                    'UUID': '%RANDOM_UUID%',
                });
            }
            if (!has_boot_k && item_id in default_boot_k) {
                tags['AttributeModifiers'].push({
                    'AttributeName': 'generic.knockback_resistance',
                    'Name': 'generic.knockback_resistance',
                    'Amount': default_boot_k[item_id],
                    'Operation': 0,
                    'Slot': 'feet',
                    'UUID': '%RANDOM_UUID%',
                });
            }
        }

        let displayed_attrs = { "mainhand": [], "offhand": [], "head": [], "chest": [], "legs": [], "feet": [], };
        tags['AttributeModifiers'].forEach((attr) => {
            let line = attributeLine(attr, sharp_lvl);
            if (line.includes('dark_green')) displayed_attrs[attr['Slot']].splice(line.includes('Damage') ? 0 : 1, 0, line);
            else displayed_attrs[attr['Slot']].push(line);
        });

        for (slot in displayed_attrs) {
            if (displayed_attrs[slot].length == 0) continue;

            tags['display']['Lore'].push("{'text':' '}");
            tags['display']['Lore'].push(`{'text':'${slot_display[slot]}','color':'gray','italic':false}`);
            displayed_attrs[slot].forEach((attr) => tags['display']['Lore'].push(attr));
        }
    }

    //if (unbreakable) tags['display']['Lore'].push("{'text':' '}");

    if (tags['display']['Lore'].length == 0) delete tags['display']['Lore'];

    let json_tags = giveJsonFormat(JSON.stringify(tags));

    let command = `/give @p ${item_id}${json_tags} 1`;

    copyToClipboard(command);
}

function highlight(element) {
    let defaultBG = element.style.backgroundColor;
    element.style.backgroundColor = "#FDFF47";
    element.scrollIntoView({ behavior: "smooth" });

    setTimeout(() => element.style.backgroundColor = defaultBG, 1000);
}

function userFilterOn() {
    let item_list = document.getElementById("item_list").children;
    for (let i = 0; i < item_list.length; i++) {
        let is_mine = item_list[i].querySelector(".item_entry_creator").textContent === username;
        item_list[i].style.display = is_mine ? "block" : "none";
    }
    filtering_user = true;
}

function userFilterOff() {
    let item_list = document.getElementById("item_list").children;
    for (let i = 0; i < item_list.length; i++) {
        item_list[i].style.display = "block";
    }
    filtering_user = false;
}

function changeUserFilter(box) {
    if(box.checked) userFilterOn();
    else userFilterOff();
}

function socketReceive(message) {
    let data = JSON.parse(message.data);
    switch (data['type']) {
        case 'add_item':
            addItem(data['item']);
            break;
        case 'load_item':
            loadItem(data['item']);
            break;
        case 'update_item':
            updateItem(data['item']);
            break;
        case 'remove_item':
            removeItem(data['id'], data['user']);
            break;
        case 'username':
            username = data['user'];
            break;
    }
}

function onceLoaded() {
    document.getElementById('add_enchant').onclick = addEnchant;
    document.getElementById('add_attribute').onclick = addAttributeM;
    document.getElementById('add_location').onclick = addLocation;
    document.getElementById('item_id').onchange = () => {
        let val = document.getElementById('item_id').value;
        document.getElementById('item_img').src = `textures/${escapeHtml(val)}.png`;
        flag_unsaved();
    };

    socket = new WebSocket("wss://" + location.host + "/socket");
    socket.onmessage = socketReceive;
    socket.onclose = () => {
        alert("Socket closed unexpectedly, please reload the page");
    };
}

document.addEventListener('DOMContentLoaded', onceLoaded, false);

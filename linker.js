// This depends on js-yaml
// BEFORE RUNNING THIS FILE run `npm i` in your terminal or else this WILL NOT FUNCTION.
// To run this, use `node linker.js`

import { load } from 'js-yaml';
import * as fs from 'fs';

const set_list = [
    // 'ABY',
    // 'AKT',
    // 'CC01',
    // 'CC02',
    // 'EXPT',
    'FOE',
    // 'HOD',
    // 'IRD',
    // 'ITD',
    // 'LAIR',
    // 'PTN',
    // 'PVR',
    // 'TDD02',
    // 'TOL03',
    // 'TTT04',
    // 'TZE01',
    // 'VNM',
    // 'VSB',
    // 'WAW'
];

function parseMSE(content) {
    const cards = [];
    const split = content.split('\ncard:\n').slice(1);
    for (const c of split) {
        const s1 = '  uid: a' + c.replaceAll('\t', '  ')
                           .split('\n  rule_text:')[0]
                           .split('\n  special_text:')[0]
                           .split('\n  uid:')[1]
                        //    .split('\n')
                        //    .map(c => c.slice(2))
                        //    .join('\n');
        // console.log('------------------------\n', c);
        const yaml_text = s1.split('\n')
                           .map(c => c.slice(2))
                           .join('\n');
        
        try {
            const yaml_data = load(yaml_text);
            cards.push({...yaml_data, source: c});
        } catch {
            console.warn(`Could not load data for card ${yaml_text.match(/name: (.*?)\n/)[1]}`)
        }
    }
    return cards;
}

// function findUid(cards, uid) {
//     return cards.find(c => uid === c.uid);
// }

function cleanName(n) {
    return n.replaceAll("’", "'")
            .replaceAll(/\<\/?[ib]\>/g, '');
}

const all_cards = JSON.parse(fs.readFileSync('all-cards.json')).cards;
const sets = {};

for (const set of set_list) {
    const set_file_path = `${set}.mse-set/set`;
    try {
        const content = fs.readFileSync(set_file_path).toString();
        fs.writeFileSync(`${set}.mse-set/set_backup`, content);
        const cards = parseMSE(content);
        sets[set] = {cards: cards, text: content};
        
    } catch (e) {
        console.error(e)
    }
}

// console.log(Object.keys(sets));
for (const set in sets) {
    const cards = sets[set].cards.map(c => ({...c, uid: c.uid.slice(2)}));
    let text = sets[set].text;
    const capped = [];
    // console.log(text);
    console.log(`Linking ${set}...`);

    for (const card of cards) {
        const clean_name = cleanName(card.name);
        const card_json = all_cards.find(c => (c.card_name === clean_name || c.card_name == clean_name + ' ' + set) && c.set === set);
        if (!card_json) {
            console.warn(`WARNING: Couldn't find ${card.name} (${set}) in all-cards.json`);
            continue;
        }

        const link_regex = `uid: ${card.uid}\n\tlinked_card_1: (.*?)\n\tlinked_card_2: (.*?)\n\tlinked_card_3: (.*?)\n\tlinked_card_4: (.*?)\n\tlinked_relation_1: (.*?)\n\tlinked_relation_2: (.*?)\n\tlinked_relation_3: (.*?)\n\tlinked_relation_4: (.*?)\n`;
        let [original_match, 
            link_1, 
            link_2, 
            link_3, 
            link_4, 
            relation_1, 
            relation_2, 
            relation_3, 
            relation_4
        ] = card.source.match(new RegExp(link_regex)) || '';

        // console.log(card.uid.toString(10));
        // console.log(card.source.match(new RegExp(`uid: ${card.uid}`, 'm')));
        // console.log(link_1);
        const setNextFreeLink = value => {
            if (!link_1) link_1 = value;
            else if (!link_2) link_2 = value;
            else if (!link_3) link_3 = value;
            else if (!link_4) link_4 = value;
            else if (!capped.includes(card.name)) {
                console.warn(`WARNING: Reached link cap on ${card.name}`);
                capped.push(card.name);
            } 
        }

        const setNextFreeRelation = value => {
            if (!relation_1) relation_1 = value;
            else if (!relation_2) relation_2 = value;
            else if (!relation_3) relation_3 = value;
            else if (!relation_4) relation_4 = value;
            // else console.warn(`WARNING: Reached relation cap on ${card.name}`);
        }
        
        // if (!card_json.related) continue;
        for (const [name, data] of Object.entries(card_json.related)) {
            // const name = data.reversed ? `${_name} ${data.set}` : _name;
            const other_card = cards.find(c => cleanName(c.name) == name);
            const uid = other_card?.uid;
            // console.log(uid);
            // console.log(uid);
            if (uid) {
                setNextFreeLink(uid);
                setNextFreeRelation(data.reversed ? 'Generator' : 'Token');

                const other_link_regex = `uid: ${uid}\n\tlinked_card_1: (.*?)\n\tlinked_card_2: (.*?)\n\tlinked_card_3: (.*?)\n\tlinked_card_4: (.*?)\n\tlinked_relation_1: (.*?)\n\tlinked_relation_2: (.*?)\n\tlinked_relation_3: (.*?)\n\tlinked_relation_4: (.*?)\n`;
                let [other_match, 
                    other_link_1, 
                    other_link_2, 
                    other_link_3, 
                    other_link_4, 
                    other_relation_1, 
                    other_relation_2, 
                    other_relation_3, 
                    other_relation_4
                ] = other_card.source.match(new RegExp(other_link_regex)) || '';


                if (!other_match) {
                    console.warn(`WARNING: Failed to match links on ${other_card.name} (${uid})`);
                    console.log(other_card.source);
                    break;
                }

                if      (!other_link_1) other_link_1 = card.uid;
                else if (!other_link_2) other_link_2 = card.uid;
                else if (!other_link_3) other_link_3 = card.uid;
                else if (!other_link_4) other_link_4 = card.uid;
                else if (!capped.includes(card.name)) {
                    console.warn(`WARNING: Reached link cap on ${card.name}`);
                    capped.push(card.name);
                } 

                const rel = data.reversed ? 'Token' : 'Generator';
                if      (!other_relation_1) other_relation_1 = rel;
                else if (!other_relation_2) other_relation_2 = rel;
                else if (!other_relation_3) other_relation_3 = rel;
                else if (!other_relation_4) other_relation_4 = rel;
                // else console.warn(`WARNING: Reached relation cap on ${card.name}`);

                // console.log('test');

                // console.log(other_match, text.match(other_match));
                text = text.replace(other_match, `uid: ${uid}\n\tlinked_card_1: ${other_link_1}\n\tlinked_card_2: ${other_link_2}\n\tlinked_card_3: ${other_link_3}\n\tlinked_card_4: ${other_link_4}\n\tlinked_relation_1: ${other_relation_1}\n\tlinked_relation_2: ${other_relation_2}\n\tlinked_relation_3: ${other_relation_3}\n\tlinked_relation_4: ${other_relation_4}\n`);
                text = text.replace(original_match, `uid: ${card.uid}\n\tlinked_card_1: ${link_1}\n\tlinked_card_2: ${link_2}\n\tlinked_card_3: ${link_3}\n\tlinked_card_4: ${link_4}\n\tlinked_relation_1: ${relation_1}\n\tlinked_relation_2: ${relation_2}\n\tlinked_relation_3: ${relation_3}\n\tlinked_relation_4: ${relation_4}\n`);
            }
        }
    }

    fs.writeFileSync(`${set}.mse-set/set`, text);
}
import os, shutil

cards = []

with open('list.txt', 'r') as f:
    for line in f.readlines():
        copies = int(line.split(' ')[0])
        card = ' '.join(line.split(' ')[1:]).strip()
        for i in range(copies): cards.append(card)

mse_cards = {}
mse_arts = {}
art_fields = [
    'image',
    'image_2',
    'mainframe_image',
    'mainframe_image_2'
]

try:
    shutil.rmtree('OUT.mse-set')
except:
    print('Unable to remove OUT')

def cleanCardName(name: str) -> str:
    return name.replace('’', "'")

for mse_set in os.listdir():
    if os.path.isfile(mse_set) or mse_set[-8:] != '.mse-set' or mse_set == 'LAIR.mse-set': continue
    print(mse_set + '...')
    for mse_card in os.listdir(mse_set):
        if mse_card[:4] != 'card': continue
        card_path = os.path.join(mse_set, mse_card)
        with open(card_path, 'r', encoding='utf-8') as f:
            card = f.read()
            if '!skipimport' in card: continue
            try:
                card_name = cleanCardName(card.split('	name: ')[1].split('\n')[0])
                mse_cards[card_name] = card_path
                mse_arts[card_name] = {}
            except:
                print(f"Couldn't find card name for {card_path}")
                continue

            for field in art_fields:
                try:
                    art = card.split(f'{field}: ')[1].split('\n')[0]
                    if art != '': mse_arts[card_name][field] = art
                except: 
                    pass
            

        
include_text = ''
os.mkdir('OUT.mse-set')

for card in cards:
    try:
        mse_card = mse_cards[card]
    except:
        print(f'Could not find card {card}')
        continue

    card_raw = mse_card.split('\\')[1]
    mse_set = mse_card.split('\\')[0]
    shutil.copy(mse_card, f'OUT.mse-set\\{card_raw}')
    for field, art in mse_arts[card].items():
        if os.path.exists(f'OUT.mse-set\\{art}'):
            with open(f'OUT.mse-set\\{card_raw}', 'r+', encoding = 'utf-8') as f:
                content = f.read()
                f.truncate(0)
                f.write(content.replace(f'{field}: {art}', f'{field}: {mse_set}_{art}'))
                shutil.copy(mse_set + '\\' + art, f'OUT.mse-set\\{mse_set}_{art}')
            continue

        shutil.copy(mse_set + '\\' + art, f'OUT.mse-set\\{art}')
    include_text += f'include file: {card_raw}\n'

default_set = f"""mse_version: 2.0.2
game: magic
game_version: 2024-10-01
stylesheet: m15-altered-plus
stylesheet_version: 2020-09-04
set_info:
	title: Output
	description: wow
	set_code: OUT
	symbol: 
	masterpiece_symbol: 
	use_gradient_multicolor: yes
	custom_mana_symbol_name: MyrCustoms/Vertex.png
	mana_symbol_options: enable in casting costs, enable in text boxes, colored mana symbols
{include_text}
version_control:
	type: none
apprentice_code: """

with open('OUT.mse-set/set', 'w') as f:
    f.write(default_set)
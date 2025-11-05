import os, shutil, sys

export_all = "--export-all" in sys.argv

include_sets = [
    "AKT",
    "EXPT",
    "FOE",
    "HEL",
    "HOD",
    "LAIR",
    # "LOB",
    "ITD",
    "PTN",
    "PVR",
    # "VGR",
    "VNM",
    "WAW",
    "END"
]

command = "git status --porcelain"
diffs = os.popen(command).read()

changed_sets = []
missing_sets = []

for line in diffs.split("\n"):
    if "1.exports/" in line or "export.py" in line: continue
    
    set_name = line[4:].split(".mse-set")[0]
    changed_sets.append(set_name)
    

sets_in_diff = []

sets_in_egg = os.listdir("1.exports/egg")
sets_in_trice = os.listdir("1.exports/trice")

existing_sets = [*sets_in_egg, *sets_in_trice]
sets = []

for exported_set in existing_sets:
    if not "-files" in exported_set: continue

    sets.append(exported_set.split("-files")[0])
    
for _set in include_sets:
    if not _set in sets:
        missing_sets.append(_set)

print(missing_sets)

sets_to_export = list({*missing_sets, *changed_sets})

print(sets_to_export)

# try:
#     shutil.rmtree("1.exports")
# except: 
#     print("error when removing")

# try:
#     os.mkdir("1.exports")
# except:
#     print("error when creating")

# try:
#     os.mkdir("1.exports/trice")
# except:
#     print("error when creating trice")

# try:
#     os.mkdir("1.exports/egg")
# except:
#     print("error when creating egg")

set_list = []
dirs = os.listdir()
basedir = os.getcwd()

for dir in dirs:
    if dir[-8:] == ".mse-set":
        set_name = dir.split(".mse-set")[0]
        if not set_name in include_sets:
            continue

        
        print(f"Cockatrice export for {set_name}...")
        os.chdir("./1.exports/trice")
        os.system(f'mse --export "magic-cockatrice-v2.mse-export-template" "{basedir}/{set_name}.mse-set" "{set_name}.xml"')

        print(f"Egg export for {set_name}...")
        os.chdir("../egg")
        os.system(f'mse --export "magic-egg-allinone-exporter.mse-export-template" "{basedir}/{set_name}.mse-set" "{set_name}.txt"')

        os.chdir(basedir)
        print(f"Done {set_name}!")
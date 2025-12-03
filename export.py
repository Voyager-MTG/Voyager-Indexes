import os, shutil

include_sets = [
    "AKT",
    "EXPT",
    "FOE",
    # "HEL",
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

try:
    shutil.rmtree("1.exports")
except: 
    print("error when removing")

try:
    os.mkdir("1.exports")
except:
    print("error when creating")

try:
    os.mkdir("1.exports/trice")
except:
    print("error when creating trice")

try:
    os.mkdir("1.exports/egg")
except:
    print("error when creating egg")

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
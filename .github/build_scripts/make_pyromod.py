import tempfile
import shutil
import json
import os
import argparse

try:
    import gitignore_parser
    useGitIgnore = True
except:
    useGitIgnore = False


def msgExit(msg):
    print(msg)
    exit(1)


homeDir = os.path.expanduser("~")
modDir = os.getcwd()
print("Mod dir is: " + modDir)
modInfoFile = os.path.join(modDir, "mod.json")
modPyromodIgnoreFile = os.path.join(modDir, ".pyromodignore")

# Sanity check
if not os.path.isfile(modInfoFile):
    msgExit("Can't find mod.json in " + modInfoFile)


# Get mod info
with open(modInfoFile, "r") as file:
    modInfo = json.load(file)
    modVersion = modInfo['version'] if "version" in modInfo else msgExit(
        "mod.json missing 'version' entry")
    print("Mod version is: " + modVersion)
    modName = modInfo['name'] if "name" in modInfo else msgExit(
        "mod.json missing 'name' entry")
    print("Mod name is: " + modName)

if os.path.isfile(os.path.join(modDir, modName + ".zip")):
    msgExit("Mod folder has zip inside. Remove to fix.")


def ignoreFilter(filePath):

    if useGitIgnore and os.path.isfile(filePath):
        matches = gitignore_parser.parse_gitignore(filePath)

        def ignore(path, entries):
            return [entry for entry in entries if matches(os.path.join(path, entry))]
    else:
        def ignore(path, names):
            return []
    return ignore


outFile = os.path.join(homeDir, "output", modName)
outFileZip = outFile + ".zip"
outFilePyromod = outFile + ".pyromod"

print("Making pyromod file: " + outFilePyromod)
with tempfile.TemporaryDirectory() as tempDir:
    stripped_mod = os.path.join(tempDir, modName)
    shutil.copytree(src=modDir,
                    dst=stripped_mod,
                    ignore=ignoreFilter(modPyromodIgnoreFile))
    shutil.make_archive(outFile, "zip", stripped_mod)
    shutil.move(outFile+".zip", outFile+".pyromod")

print("Making zip file: " + outFileZip)
with tempfile.TemporaryDirectory() as tempDir:
    deepPath = os.path.join(tempDir, modName)
    os.makedirs(deepPath)
    deepZip = os.path.join(deepPath, modName+".zip")
    shutil.copyfile(outFile+".pyromod", deepZip)
    shutil.copyfile(modInfoFile, os.path.join(deepPath, "mod.json"))
    shutil.make_archive(outFile, "zip", tempDir)


def setEnvValue(key, value):
    print(f"Setting env varaible: {key}={value}")
    os.system(f"echo \"{key}={value}\" >> $GITHUB_ENV ")


setEnvValue("PYROMOD_MOD_NAME", modName)
setEnvValue("PYROMOD_MOD_VERSION", modVersion)
setEnvValue("PYROMOD_PYROMOD_FILE_PATH", outFilePyromod)
setEnvValue("PYROMOD_ZIP_FILE_PATH", outFileZip)

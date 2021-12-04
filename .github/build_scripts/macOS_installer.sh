#!/bin/sh

# A Git clone of the boonGUI mod will be created in the 0ad mods folder. Once complete, simply open the 0ad app and activate the mod via the mod selection.
echo "Running Installation Script"
cd ~/Library/Application\ Support/0ad/mods/
git clone https://github.com/LangLangBart/boonGUI.git
echo "installation complete you may run 0 A.D. now"
exit

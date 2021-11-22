#!/bin/sh



echo "Running Installation Script"
# Changes Dir to 0 A.Ds default installation Dir
cd ~/Library/Application\ Support/0ad/mods/

#clones the latest version of BoonGui
git clone https://github.com/LangLangBart/boonGUI.git
#tells user it has been installed
echo "installation complete you may run 0 A.D. now"
#ends programme
exit

#!/bin/bash


# Requests Installation Medium (currently Ubuntu only

# echo "How was 0 A.D. installed? 
#1. Snap
#2. apt 
#(Respond with numbers only)"

echo "Running Installation Script"
pwd
cd ~/snap/0ad/242/.local/share/0ad/mods

#making sure git is installed
sudo apt install git -y
#clonini
git clone https://github.com/LangLangBart/boonGUI.git

echo "installation complete running 0 A.D."

0ad

exit

<!-- Title -->
<div align="center">

# boonGUI <br>
<!-- Development badges -->
[![commits][commits-image]][commits-url]
[![maintained][maintained-image]][commits-url]
[![lint][lint-image]][lint-url]

[commits-image]: https://img.shields.io/github/commits-since/LangLangBart/boonGUI/latest/main?label=Commits%20ahead%20of%20Release&style=flat-square
[commits-url]: https://github.com/LangLangBart/boonGUI
[maintained-image]: https://img.shields.io/maintenance/yes/2022?label=Maintained&style=flat-square
[lint-image]: https://img.shields.io/github/workflow/status/LangLangBart/boonGUI/Lint/main?label=ESLint&style=flat-square
[lint-url]: https://github.com/LangLangBart/boonGUI/actions/workflows/lint.yml

<!-- General badges -->
[![release][release-image]][release-url]
[![compatibility][compatibility-image]][compatibility-url]
[![forum][forum-image]][forum-url]

[release-image]: https://img.shields.io/github/release/LangLangBart/boonGUI.svg?style=flat-square&color=gold&label=Latest%20Release
[release-url]: https://github.com/LangLangBart/boonGUI/releases/latest
[compatibility-image]: https://img.shields.io/badge/dynamic/json?style=flat-square&color=green&label=Compatibility&query=dependencies&url=https%3A%2F%2Fraw.githubusercontent.com%2FLangLangBart%2FboonGUI%2Fmain%2Fmod.json
[compatibility-url]: https://play0ad.com/download/
[forum-image]: https://img.shields.io/badge/Discussion-Forum-orange?style=flat-square
[forum-url]: https://wildfiregames.com/forum/topic/37147-boongui-mod-compatible-with-a25

User interface **mod** for the RTS game **0 A.D.**

<!-- 0 A.D. logo -->
<a href="https://play0ad.com"><img src="Images/0ad_logo.png" width="300">

<h4>
  <a href="https://play0ad.com/re-release-of-0-a-d-alpha-25-yauna/">Website</a>
  <span> | </span>
  <a href="https://github.com/0ad/0ad">GitHub</a>
  <span> | </span>
  <a href="https://peertube.debian.social/videos/watch/7d134d11-0b25-42bc-92dd-13c496863e8e">Project Overview</a>
  <span> | </span>
  <a href="https://trac.wildfiregames.com/wiki/FAQ">FAQ</a>
</h4>

---


### Featured v2.4

<p>
<a href="https://www.youtube.com/channel/UCnpCp_OvNm0_FgD_5rSrxbw"><img src="https://img.shields.io/badge/Channel-Plan&Go:%200%20A.D.-green?logo=youtube&style=social" height="20"></a>
 <a href="https://www.youtube.com/watch?v=PhdbEN6UoG4"><img src="https://img.shields.io/youtube/views/PhdbEN6UoG4?style=social" height="20"></a>
</p>
<p align="center">
<a href="https://www.youtube.com/watch?v=PhdbEN6UoG4"><img src="http://img.youtube.com/vi/PhdbEN6UoG4/0.jpg" width="400"></a>
</p>

### Featured v2.2
<p>
<a href="https://www.youtube.com/channel/UC1VT4fBC8ZWmT61-x5sR9TA"><img src="https://img.shields.io/badge/Channel-Zephyr%20Amethyst-green?logo=youtube&style=social" height="20"></a>
<a href="https://www.youtube.com/watch?v=FT8DDQEU8YA"><img src="https://img.shields.io/youtube/views/FT8DDQEU8YA?style=social" height="20"></a>
</p>
<p align="center">
<a href="http://www.youtube.com/watch?v=FT8DDQEU8YA"><img src="http://img.youtube.com/vi/FT8DDQEU8YA/0.jpg" width="400"></a>
</p>

### Featured v2.0.2
<p>
<a href="https://www.youtube.com/channel/UC5Sf1aQufzzWATg9TJzg7mQ"><img src="https://img.shields.io/badge/Channel-0AD%20Newbie%20Rush-green?logo=youtube&style=social" height="20"></a>
<a href="https://www.youtube.com/watch?v=nt3HSmRc7ss"><img src="https://img.shields.io/youtube/views/nt3HSmRc7ss?style=social" height="20"></a>
</p>
<p align="center">
<a href="http://www.youtube.com/watch?v=nt3HSmRc7ss"><img src="http://img.youtube.com/vi/nt3HSmRc7ss/0.jpg" width="400"></a>
</p>;

</div>

---

## Features
* **Main menu**
  * Cheat codes accessible through the game manual.
  * New background image
* **Camera**
  * Enter the view of a unit via a hotkey.
  * Change the camera settings in the options.
* **In-Game**
  * All fruits are more vivid and easier to see due to the increased saturation and brightness, some have also had their hue changed.
  * Chicken are 50% larger and fish were colored red.
  * Increased the size of weapon projectiles and the garrison flag on buildings.
  * All player colors are more vivid and easier to see on the minimap.
  * Larger buttons in the selection panel.
  * Larger and redesigned round minimap. The idle button displays the total number of idle workers.
  * Additional ingame stats about the players.
  * Rally points are displayed for observers.
  * Timestamp notifications for players moving up a phase or completing one.
  * The HUD in the centre shows the values of the individual units. Relics show their auras and treasures their contents.
  * Option to skip the summary screen after a game ends.
  * All civilian houses/apartments have a garrison flag.
  * All heroes have a large visible object flowing over their head, making them easier to see on the battlefield.
  * Sound notification for the death of a hero.
* **Lobby**
  * Quick access buttons below the chat input.
  * Rating dependent icon & title for the profile.
  * Layout rearrangements to improve the overall experience.
* **Replay screen**
  * Adding a button next to the replay file path to quickly open the directory.
* **Summary screen**
  * Increased the size, recommend to use a 1920x1080 display.

---

## Installation
```
git clone https://github.com/LangLangBart/boonGUI.git
```
* Place it in your `/0ad/mods/` folder:
  * Linux: `~/.local/share/0ad/mods/`
  * macOS: `~/Library/Application\ Support/0ad/mods/`
  * Windows: `~\Documents\My Games\0ad\mods\`
* Launch 0 A.D., click `Settings` and `Mod Selection`.
* Double-click `boonGUI`, click `Save Configuration` and `Start Mods`.

### Convenient installation
<details>
 <summary><b>Arch and Manjaro Linux users</b></summary>
<p>

You can skip the above steps and install the <a href="https://aur.archlinux.org/packages/0ad-boongui/">boonGUI package from the AUR</a>.
</p>
</details>

<details>
 <summary><b>macOS Installer</b></summary>
<p>

Paste it into your macOS terminal and press enter. The mod will be downloaded and placed in the correct 0ad mods folder.
```zsh
zsh -c "$(curl -fsSL https://raw.githubusercontent.com/LangLangBart/boonGUI/main/.github/build_scripts/macOS_installer.sh)"
```
</p>
</details>

---

## Contributing
1. Fork it.
2. Create a new feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git add .` and `git commit -m 'Add some feature'`
4. Push it to the branch: `git push origin my-new-feature`
5. Submit a pull request.

<details>
 <summary><b>Setup for VSCode</b></summary>
<p>

#### Javacript
It is not necessary to set up a linter when you make a pull request. A GitHub action has been set up to automatically adjust your code to the rules. You can also lint your code locally, see instructions below.

Mirroring the linting process from 0 A.D. by using [ESLint](https://eslint.org) and an adopted set of rules defined in the [eslintrc.json](../.eslintrc.json) file.

* (1/3) install `node.js` e.g. via Homebrew and after that install the `yarn` package globally.

```zsh
brew install node
npm install -g yarn
```

* (2/3) The dependencies are defined in the `package.json` file and can be simply installed by running:

```zsh
yarn
```

* (3/3) Create a `.gitignore_global` and add `node_modules` and `yarn.lock` to it.

```zsh
git config --global core.excludesfile ~/.gitignore_global
nano ~/.gitignore_global
node_modules
yarn.lock
```

* The `.vscode` settings have been set up to automatically adjust your code to the rules when you save the document.
* An optional installation of the [VSCode ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) will run eslint on each file and display warnings/errors immediately.
* You can also lint and correct your entire repository with the following commands.

```zsh
npx eslint .
npx eslint . --fix
```

#### XML
When working with XML files, I use the default settings of the [VSCode XML Tools extension](https://marketplace.visualstudio.com/items?itemName=DotJoshJohnson.xml).

</p>
</details>

### Contributors
Motivation for this mod was the desire to learn javascript and create a tool for @mysticjim to help him create his YouTube videos. Since then many people have contributed to this mod, to all of those I wanted to say thank you.
* A complete makeover of the stats overlay was done thanks to @Islan.
* Thanks to @Effervescent, @mysticjim, @Nobbi, @Palaiologos and @seeh for constantly testing and giving feedback.
* Providing code and helping with problems: @andy5995, @kaaduu, @maroder, @Nescio, @Pretuer and @Schweini.
* Thanks to @badosu, @ffffff, @ffm2, @nani, @The Undying Nephalim and @wowgetoffyourcellphone for creating the following mods: Prodmod, fGod, ffm_visibility, Autociv, Hyrule Conquest and Delenda Est.
* Being good lads @elexis, @bb, @Imarok, @wraitii, @Freagarach, @vladislavbelov, @Silier and @Stan` pointed me in the right direction on the IRC #0ad channel when I got stuck.

<br>

<div align="center">

### If you want to contribute, give feedback or make suggestions, go ahead.
# ❤️

</div>

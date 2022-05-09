<!-- Title -->
<div align="center">

# boonGUI <br>

<p>
<a href="https://github.com/LangLangBart/boonGUI/releases"><img src="https://img.shields.io/github/release/LangLangBart/boonGUI.svg?style=for-the-badge&color=gold&label=Version" height="18"></a>
<a href="https://play0ad.com/download/"><img src="https://img.shields.io/badge/Compatibility-Alpha25%3A%20Yaunā-gold?style=for-the-badge" height="18"></a>
<a href="https://wildfiregames.com/forum/topic/37147-boongui/"><img src="https://img.shields.io/github/downloads/LangLangBart/boonGUI/total.svg?color=gold&amp&label=%E2%88%91%20Downloads&amp&style=for-the-badge" height="18"></a>
<a href="https://wildfiregames.com/forum/topic/37147-boongui/"><img src="https://img.shields.io/badge/Discussion-Forum-gold?style=for-the-badge" height="18"></a>
</p>

<p>
<a href="https://github.com/LangLangBart/boonGUI/commits/main"><img src="https://img.shields.io/github/commits-since/LangLangBart/boonGUI/latest/main?style=for-the-badge" height="18"></a>
<a href="https://github.com/LangLangBart/boonGUI/actions/workflows/lint.yml"><img src="https://img.shields.io/github/workflow/status/LangLangBart/boonGUI/Lint/main?label=ESLint&style=for-the-badge" height="18"></a>
<a href="https://github.com/LangLangBart/boonGUI/commits/main"><img src="https://img.shields.io/github/commit-activity/m/LangLangBart/boonGUI?style=for-the-badge" height="18"></a>
</p>

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
<a href="https://www.youtube.com/channel/UC5Sf1aQufzzWATg9TJzg7mQ"><img src="https://img.shields.io/static/v1?label=Channel&message=0AD%20Newbie%20Rush&logo=YouTube&color=FF0000&style=for-the-badge" height="18"></a>
<a href="https://www.youtube.com/watch?v=CA2ZaEsDkiA"><img src="https://img.shields.io/youtube/views/CA2ZaEsDkiA?color=FF0000&logo=youtube&style=for-the-badge" height="18"></a>
</p>
<p align="center">
<a href="http://www.youtube.com/watch?v=CA2ZaEsDkiA"><img src="http://img.youtube.com/vi/CA2ZaEsDkiA/0.jpg" width="325"></a>
</p>

<p>
<a href="https://www.youtube.com/channel/UCnpCp_OvNm0_FgD_5rSrxbw"><img src="https://img.shields.io/static/v1?label=Channel&message=Plan%26Go:%200%20%20A.D.&logo=YouTube&color=FF0000&style=for-the-badge" height="18"></a>
 <a href="https://www.youtube.com/watch?v=PhdbEN6UoG4"><img src="https://img.shields.io/youtube/views/PhdbEN6UoG4?color=FF0000&logo=youtube&style=for-the-badge" height="18"></a>
</p>
<p align="center">
<a href="https://www.youtube.com/watch?v=PhdbEN6UoG4"><img src="http://img.youtube.com/vi/PhdbEN6UoG4/0.jpg" width="325"></a>
</p>

</div>

---

## ✨ Features
### 🕹 In-Game
  * Large round round minimap
  * Rally points are displayed for observers.
  * Bigger buttons for the construction panel
  * Additional ingame stats about the players
  * All player colors and fruits have more vivid colors.
  * Increased weapon projectiles, chickens and garrison flag on buildings.
  * The HUD in the centre shows the values of the individual units. Relics show their auras and treasures their contents.
  * All heroes have a large visible object flowing over their head, making them easier to see on the battlefield.

### 🌊 Miscellaneous UI improvements
  * **Camera:** Change the camera settings in the options.
  * **Lobby:** Quick access buttons below the chat input.
  * **Main menu:** New background image
  * **Replays:** overview: Adding a button next to the replay file path to quickly open the directory.
  * **Summary:** Increased the size, recommend to use a 1920x1080 display.

---

## ⬇️ Install
Standard location for the `/0ad/mods/` folder
* Linux: `~/.local/share/0ad/mods/`
* macOS: `~/Library/Application\ Support/0ad/mods/`
* Windows: `~\Documents\My Games\0ad\mods\`

Choose your preferred method
* **Github**
  * Clone it in your `/0ad/mods/` folder:
```
git clone https://github.com/LangLangBart/boonGUI.git
```

* **Pyromod**
  * Drag and drop the file over the 0ad start icon or double click it.
  * The mod will be unpacked and placed automatically in your `/0ad/mods/` folder.
* **ZIP**
  * Unpack it it in your `/0ad/mods/` folder.

* Launch 0 A.D., click `Settings` and `Mod Selection`.
* Double-click `boonGUI`, click `Save Configuration` and `Start Mods`.

---

## 💪 Contributing
1. Fork it.
2. Create a new feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git add .` and `git commit -m 'Add some feature'`
4. Push it to the branch: `git push origin my-new-feature`
5. Submit a pull request.

<details>
 <summary><b>Setup for VSCode</b></summary>
<p>

#### Javacript
Mirroring the linting process from 0 A.D. by using [ESLint](https://eslint.org) and an adopted set of rules defined in the [eslintrc.json](../.eslintrc.json) file.

* (1/2) install `node.js` e.g. via Homebrew (macOS) and after that install the `yarn` package globally.

```zsh
brew install node
npm install -g yarn
```

* (2/2) The dependencies are defined in the `package.json` file and can be simply installed by running:

```zsh
yarn install
# [Optional] A pre-commit hook to check your working copy for lint problems and fix them if possible is defined in the package.json file. To use it, run the following command once. If you make changes to the hook, run the command again.
npx simple-git-hooks
# Confirmation messages
# [INFO] Successfully set the pre-commit with command: yarn lint-staged
# [INFO] Successfully set all git hooks
```

* The `.vscode` settings have been set up to automatically adjust your code to the rules when you save the document.
* An optional installation of the [VSCode ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) will run eslint on each file and display warnings/errors immediately.
* Alternatively, you can skip all the steps above and just lint and correct your entire repository with the following commands.

```zsh
npx eslint .
npx eslint . --fix
```

#### XML
When working with XML files, I use the default settings of the [VSCode XML Tools extension](https://marketplace.visualstudio.com/items?itemName=DotJoshJohnson.xml).

</p>
</details>

### Contributors
Motivation for this mod was the desire to learn JavaScript by creating a tool for @mysticjim to help him with his YouTube videos. Since then many people have contributed to this mod and I would like to thank them here.
* A complete makeover of the stats overlay was done thanks to @Islan.
* Thanks to @Effervescent, @mysticjim, @Nobbi, @Palaiologos and @seeh for constantly testing and giving feedback.
* Providing code and helping with problems: @andy5995, @kaaduu, @maroder, @Nescio, @Pretuer and @Schweini.
* Thanks to other modders:
  * @nani - [Autociv](https://github.com/nanihadesuka/autociv)
  * @wowgetoffyourcellphone - [Delenda Est](https://github.com/JustusAvramenko/delenda_est)
  * @ffm2 - [ffm_visibility](https://wildfiregames.com/forum/topic/27124-ffm_visibility-mod/)
  * @ffffff - [fGod](https://github.com/fraizy22/fgodmod)
  * @badosu - [Prodmod](https://github.com/badosu/prodmod)
  * @The Undying Nephalim - [Hyrule Conquest](https://www.moddb.com/mods/hyrule-conquest)
  * @wraitii - [ui_mod](https://github.com/wraitii/ui_mod)
* Being good lads @elexis, @bb, @Imarok, @wraitii, @Freagarach, @vladislavbelov, @Silier and @Stan` pointed me in the right direction on the IRC #0ad/#0ad-dev channel when I got stuck.

<br>

<div align="center">

### If you want to contribute, give feedback or make suggestions, go ahead.
# ❤️

</div>

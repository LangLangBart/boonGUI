/**
 * The purpose of this class is to display information about the selected game.
 */
class GameDetails
{
	constructor(dialog, gameList, mapCache)
	{
		this.mapCache = mapCache;

		this.playernameArgs = {};
		this.playerCountArgs = {};
		this.gameStartArgs = {};

		this.lastGame = {};

		this.gameDetails = Engine.GetGUIObjectByName("gameDetails");

		this.sgMapName = Engine.GetGUIObjectByName("sgMapName");
		this.sgGame = Engine.GetGUIObjectByName("sgGame");
		this.sgDescription = Engine.GetGUIObjectByName("sgDescription");
		this.sgMapSize = Engine.GetGUIObjectByName("sgMapSize");
		this.sgMapPreview = Engine.GetGUIObjectByName("sgMapPreview");

		gameList.registerSelectionChangeHandler(this.onGameListSelectionChange.bind(this));

		this.resize(dialog);
	}

	resize(dialog)
	{
		const bottom = Engine.GetGUIObjectByName(dialog ? "leaveButton" : "joinButton").size.top - 5;
		const size = this.gameDetails.size;
		size.bottom = bottom;
		this.gameDetails.size = size;
	}

	/**
	 * Populate the game info area with information on the current game selection.
	 */
	onGameListSelectionChange(game)
	{
		this.gameDetails.hidden = !game;
		if (!game)
			return;

		Engine.ProfileStart("GameDetails");

		const stanza = game.stanza;
		const displayData = game.displayData;

		if (stanza.mapType != this.lastGame.mapType || stanza.mapName != this.lastGame.mapName)
		{
			this.sgMapName.caption = `${displayData.mapType}/${displayData.mapName}`;
			if (this.mapCache.checkIfExists(stanza.mapType, stanza.mapName))
				this.sgMapPreview.sprite = this.mapCache.getMapPreview(stanza.mapType, stanza.mapName);
			else
				this.sgMapPreview.sprite = this.mapCache.getMapPreview(stanza.mapType);
		}

		{
			let txt = escapeText(stanza.name);

			this.playernameArgs.playername = escapeText(stanza.hostUsername);

			if (stanza.startTime)
			{
				this.gameStartArgs.time =
				Math.round((Date.now() - stanza.startTime * 1000) / (1000 * 60));
				txt += sprintf(this.GameStartFormat, this.gameStartArgs);
			}

			this.sgGame.caption = setStringTags(txt, this.isCompatible ? Game.prototype.IncompatibleTags : Game.prototype.StateTags[stanza.state]);

			const textHeight = this.sgGame.getTextSize().height + 12;

			const sgGameSize = this.sgGame.size;
			sgGameSize.bottom = textHeight;
			this.sgGame.size = sgGameSize;
		}

		{
			// Victory condition, map type and size
			let txt = `${setStringTags(this.VictoryConditionsFormat, this.CaptionTags)} ${
				stanza.victoryConditions ?
					stanza.victoryConditions.split(",").map(translateVictoryCondition).join(this.Comma) :
					translateWithContext("victory condition", "Endless Game")}`;

			txt +=
				`\n${setStringTags(this.MapSizeFormat, this.CaptionTags)} ${displayData.mapSize}`;

			// Player information
			txt += "\n\n";
			this.playerCountArgs.current = escapeText(stanza.nbp);
			this.playerCountArgs.total = escapeText(stanza.maxnbp);
			txt += setStringTags(sprintf(this.PlayerCountFormat, this.playerCountArgs), this.CaptionTags) + setStringTags(sprintf(this.HostFormat, this.playernameArgs), this.HostFormatCaptionTags);

			txt += `\n${formatPlayerInfo(game.players)}`;

			// Mod information
			txt += "\n\n";
			if (!game.isCompatible)
				txt += setStringTags(coloredText(setStringTags(this.IncompatibleModsFormat, this.CaptionTags), "red"), {
					"tooltip": sprintf(translate("You have some incompatible mods:\n%(details)s"), {
						"details": comparedModsString(game.mods, Engine.GetEngineInfo().mods)
					})
				});
			else
				txt += setStringTags(this.ModsFormat, this.CaptionTags);

			const sortedMods = game.mods;
			sortedMods.sort((a, b) => a.ignoreInCompatibilityChecks - b.ignoreInCompatibilityChecks);
			for (const mod of sortedMods)
			{
				let modStr = escapeText(modToString(mod));
				if (mod.ignoreInCompatibilityChecks)
					modStr = setStringTags(coloredText(modStr, "180 180 180"), {
						"tooltip": translate("This mod does not affect MP compatibility")
					});
				txt += `\n${modStr}`;
			}

			// Map description
			txt += `\n\n${setStringTags(this.MapDescriptionFormat, this.CaptionTags)}\n${displayData.mapDescription}`;

			this.sgDescription.caption = txt;

			// Resize the box
			const textHeight = this.sgDescription.getTextSize().height;
			const size = this.sgDescription.size;
			size.top = this.sgGame.size.bottom + 5;
			this.sgDescription.size = size;
		}

		this.lastGame = game;
		Engine.ProfileStop();
	}
}

GameDetails.prototype.HostFormat = translate("  (hosted by %(playername)s)");

GameDetails.prototype.HostFormatCaptionTags = {
	"color": "163 162 160"
};

GameDetails.prototype.PlayerCountFormat = translate("Players: %(current)s/%(total)s");

GameDetails.prototype.VictoryConditionsFormat = translate("Victory Conditions:");

// Translation: Comma used to concatenate victory conditions
GameDetails.prototype.Comma = translate(", ");

GameDetails.prototype.ModsFormat = translate("Mods:");

GameDetails.prototype.IncompatibleModsFormat = translate("Mods (incompatible):");

// Translation: %(time)s is the hour and minute here.
GameDetails.prototype.GameStartFormat = translate(" (%(time)smin)");

GameDetails.prototype.MapSizeFormat = translate("Map Size:");

GameDetails.prototype.MapDescriptionFormat = translate("Map Description:");

GameDetails.prototype.CaptionTags = {
	"font": "sans-bold-16",
	"color": "255 185 0"
};

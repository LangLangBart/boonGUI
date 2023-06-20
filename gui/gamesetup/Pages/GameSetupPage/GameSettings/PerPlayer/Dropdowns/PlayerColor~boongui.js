PlayerSettingControls.PlayerColor.prototype.render = function()
{
	if (g_GameSettings.playerCount.nbPlayers < this.playerIndex + 1)
		return;

	const hidden = !g_IsController || g_GameSettings.map.type == "scenario";
	this.dropdown.hidden = hidden;
	this.playerColorHeading.hidden = hidden;

	const value = makeColorsVivid(g_GameSettings.playerColor.get(this.playerIndex));
	this.playerBackgroundColor.sprite = `color:${rgbToGuiColor(value, 100)}`;

	this.values = g_GameSettings.playerColor.available;
	this.dropdown.list = this.values.map(color => coloredText(this.ColorIcon, rgbToGuiColor(makeColorsVivid(color))));
	this.dropdown.list_data = this.values.map((color, i) => i);
	this.setSelectedValue(this.values.map((color, i) => {
		if (color.r === value.r && color.g === value.g && color.b === value.b)
			return i;
		return undefined;
	}).filter(x => x !== undefined)?.[0] ?? -1);
};

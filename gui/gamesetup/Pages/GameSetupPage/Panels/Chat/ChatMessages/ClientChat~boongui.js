ChatMessageEvents.ClientChat.prototype.colorizePlayernameByGUID = function(guid)
{
	// TODO: Controllers should have the moderator-prefix
	const username = g_PlayerAssignments[guid] ? escapeText(g_PlayerAssignments[guid].name) : translate("Unknown Player");
	const playerID = g_PlayerAssignments[guid] ? g_PlayerAssignments[guid].player : -1;

	let color = "white";
	if (playerID > 0)
	{
		color = makeColorsVivid(g_GameSettings.playerColor.values[playerID - 1]);
		const [h, s, l] = rgbToHsl(color.r, color.g, color.b);
		const [r, g, b] = hslToRgb(h, s, Math.max(0.6, l));
		color = brightenedColor(rgbToGuiColor({ "r": r, "g": g, "b": b }));
	}

	return coloredText(username, color);
};

ChatMessageEvents.ClientChat.prototype.SenderTags = {
	"font": "sans-stroke-16"
};

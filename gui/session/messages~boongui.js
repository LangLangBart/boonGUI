function colorizePlayernameByIDReturnNick(playerID)
{
	const username = splitRatingFromNick(g_Players[playerID] && escapeText(g_Players[playerID].name)).nick;
	return colorizePlayernameHelper(username, playerID);
}

function colorizePlayernameHelper(username, playerID)
{
	const playerColor = playerID > -1 ? brightenedColor(g_DiplomacyColors.getPlayerColor(playerID)) : "white";
	return coloredText(username || translate("Unknown Player"), playerColor);
}

/**
 * Some colors must become brighter so that they are readable on dark backgrounds.
 * Modified version from gui/lobby/LobbyPage/PlayerColor.GetPlayerColor function
 * Additional check for "perceivedBrightness", if the color is already bright enough don't change it
 * https://www.w3.org/TR/AERT/#color-contrast
 * @param   {string}  color  string of rgb color, e.g. "10 10 190" ("Dark Blue")
 * @return  {string}         string of brighter rgb color, e.g. "57 57 245" ("Blue")
 */
function brightenedColor(color)
{
	const [r, g, b] = color.split(" ").map(x => +x);
	const perceivedBrightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;

	if (perceivedBrightness > 75)
		return color;
	const [h, s, l] = rgbToHsl(r, g, b);
	return hslToRgb(h, s, Math.min(l + 0.3, 0.65)).join(" ");

}

function updateTutorial(notification)
{
	// Show the tutorial panel if not yet done
	Engine.GetGUIObjectByName("tutorialPanel").hidden = false;

	if (notification.warning)
	{
		Engine.GetGUIObjectByName("tutorialWarning").caption = coloredText(translate(notification.warning), "orange");
		return;
	}

	const notificationText =
		notification.instructions.reduce((instructions, item) =>
			instructions + (typeof item == "string" ? translate(item) : colorizeHotkey(translate(item.text), item.hotkey)),
		"");

	Engine.GetGUIObjectByName("tutorialText").caption = g_TutorialMessages.concat(setStringTags(notificationText, g_TutorialNewMessageTags)).join("\n");
	g_TutorialMessages.push(notificationText);

	if (notification.readyButton)
	{
		Engine.GetGUIObjectByName("tutorialReady").hidden = false;
		if (notification.leave)
		{
			Engine.GetGUIObjectByName("tutorialWarning").caption = translate("Click to quit this tutorial.");
			Engine.GetGUIObjectByName("tutorialReady").caption = translate("Quit");
			Engine.GetGUIObjectByName("tutorialReady").onPress = () => { endGame(true); };
		}
		else
			Engine.GetGUIObjectByName("tutorialWarning").caption = translate("Click when ready.");
	}
	else
	{
		Engine.GetGUIObjectByName("tutorialWarning").caption = translate("Follow the instructions.");
		Engine.GetGUIObjectByName("tutorialReady").hidden = true;
	}
}

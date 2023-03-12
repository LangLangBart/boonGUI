const boonGUI_ColorsSeenBefore = {};

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
 * Some text colors must become brighter so that they are readable on dark backgrounds.
 * Modified version from gui/lobby/LobbyPage/PlayerColor.GetPlayerColor
 * Additional check for "perceived brightness", if the color is already bright enough don't change it,
 * otherwise go up in small incremental steps till it is bright enough.
 * https://www.w3.org/TR/AERT/#color-contrast
 * @param   {string}  color  				string of rgb color, e.g. "10 10 190" ("Dark Blue")
 * @param   {number}  brightnessThreshold 	Value when a color is considered bright enough; Range:0-255
 * @return  {string}        				string of brighter rgb color, e.g. "100 100 248" ("Blue")
 */
function brightenedColor(color, brightnessThreshold = 115)
{
	// check if a cached version is already available
	if (boonGUI_ColorsSeenBefore[color])
		return boonGUI_ColorsSeenBefore[color];
	let [r, g, b] = color.split(" ").map(x => +x);
	let i = 0;
	while(r * 0.299 + g * 0.587 + b * 0.114 <= brightnessThreshold)
	{
		i += 0.001;
		const [h, s, l] = rgbToHsl(r, g, b);
		[r, g, b] = hslToRgb(h, s, l + i);
	}
	boonGUI_ColorsSeenBefore[color] = [r, g, b].join(" ");
	return boonGUI_ColorsSeenBefore[color];
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

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
 * Modified function: http://github.com/badosu/prodmod
 * Some colors must become brighter so that they are readable on dark backgrounds.
 * @param   {string}  color  string of rgb color, e.g. "21 55 200" (dark-blue "Persian Blue")
 * @return  {string}         striing of rgb colors a brighter, e.g. "100 129 255" (blue/turquise "Blueberry")
 */
function brightenedColor(color)
{
	const threshold = 255.999;
	let rgb = color.split(" ").map(x => +x);
	let m = Math.max(...rgb);
	const amount = m < 150 ? 100 : (m < 170 || rgb[2] >= 200) ? 60 : 0;
	if (amount)
		rgb = rgb.map(x => x + amount);
	m = Math.max(...rgb);
	if (m > threshold)
	{
		const total = rgb.reduce((acc, val) => acc + val, 0);
		const x = (3 * threshold - total) / (3 * m - total);
		if (total >= 3 * threshold)
			rgb.fill(threshold);
		else
			for (const i in rgb)
				rgb[i] = threshold - x * m + x * rgb[i];
	}
	return rgb.map(element => Math.floor(element)).join(" ");
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

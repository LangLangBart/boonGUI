function colorizePlayernameByIDReturnNick(playerID)
{
	const username = splitRatingFromNick(g_Players[playerID] && escapeText(g_Players[playerID].name)).nick;
	return colorizePlayernameHelper(username, playerID);
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

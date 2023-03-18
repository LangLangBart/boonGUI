/**
 * Opens the selected replay in the users preferred application for files.
 */
function openReplayDirectory()
{
	const selected = Engine.GetGUIObjectByName("replaySelection").selected;
	if (selected == -1)
		return;

	Engine.OpenURL(Engine.GetReplayDirectoryName(g_ReplaysFiltered[selected].directory));
}

/**
 * Starts the selected visual replay, or shows an error message in case of incompatibility.
 */
function startReplay()
{
	var selected = Engine.GetGUIObjectByName("replaySelection").selected;
	if (selected == -1)
		return;

	var replay = g_ReplaysFiltered[selected];
	if (isReplayCompatible(replay))
	{
		Engine.ConfigDB_CreateAndWriteValueToFile("user", "boongui.replay.matchID", replay.attribs.matchID, "config/user.cfg");
		Engine.ConfigDB_CreateAndWriteValueToFile("user", "boongui.replay.duration", replay.duration, "config/user.cfg");
		reallyStartVisualReplay(replay.directory);
	}
	else
		displayReplayCompatibilityError(replay);
}

/**
 * Opens the summary screen of the given replay, if its data was found in that directory.
 */
function showReplaySummary()
{
	var selected = Engine.GetGUIObjectByName("replaySelection").selected;
	if (selected == -1)
		return;

	// Load summary screen data from the selected replay directory
	const simData = Engine.GetReplayMetadata(g_ReplaysFiltered[selected].directory);

	if (!simData)
	{
		messageBox(500, 200, translate("No summary data available."), translate("Error"));
		return;
	}

	Engine.SwitchGuiPage("page_summary.xml", {
		"sim": simData,
		"gui": {
			"dialog": false,
			"isReplay": true,
			"replayDirectory": g_ReplaysFiltered[selected].directory,
			"replaySelectionData": createReplaySelectionData(g_ReplaysFiltered[selected].directory),
			"summarySelection": g_SummarySelection
		}
	});
}

/**
 * BoonGUI function to close the replay menu the correct way, depending on whether you are in the lobby or not.
 */
function closeReplay()
{
	if (Engine.HasXmppClient())
	{
		Engine.LobbySetPlayerPresence("available");
		return Engine.PopGuiPage();
	}
	return Engine.SwitchGuiPage("page_pregame.xml");
}

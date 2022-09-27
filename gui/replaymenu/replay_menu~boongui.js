/**
 * Shows preview image, description and player text in the right panel.
 */
function displayReplayDetails()
{
	const selected = Engine.GetGUIObjectByName("replaySelection").selected;
	const replaySelected = selected > -1;

	Engine.GetGUIObjectByName("replayInfo").hidden = !replaySelected;
	Engine.GetGUIObjectByName("replayInfoEmpty").hidden = replaySelected;
	Engine.GetGUIObjectByName("startReplayButton").enabled = replaySelected;
	Engine.GetGUIObjectByName("deleteReplayButton").enabled = replaySelected;
	Engine.GetGUIObjectByName("openReplayDirectoryButton").hidden = !replaySelected;
	Engine.GetGUIObjectByName("replayFilename").hidden = !replaySelected;
	Engine.GetGUIObjectByName("summaryButton").hidden = true;

	if (!replaySelected)
		return;

	const replay = g_ReplaysFiltered[selected];

	Engine.GetGUIObjectByName("sgMapName").caption = translate(replay.attribs.settings.mapName);
	Engine.GetGUIObjectByName("sgMapSize").caption = translateMapSize(replay.attribs.settings.Size);
	Engine.GetGUIObjectByName("sgMapType").caption = translateMapType(replay.attribs.mapType);
	Engine.GetGUIObjectByName("sgVictory").caption = replay.attribs.settings.VictoryConditions.map(victoryConditionName =>
		translateVictoryCondition(victoryConditionName)).join(translate(", "));
	Engine.GetGUIObjectByName("sgNbPlayers").caption = sprintf(translate("Players: %(numberOfPlayers)s"),
		{ "numberOfPlayers": replay.attribs.settings.PlayerData.length });
	Engine.GetGUIObjectByName("replayFilename").caption = Engine.GetReplayDirectoryName(replay.directory);

	const metadata = Engine.GetReplayMetadata(replay.directory);
	Engine.GetGUIObjectByName("sgPlayersNames").caption =
		formatPlayerInfo(
			replay.attribs.settings.PlayerData,
			Engine.GetGUIObjectByName("showSpoiler").checked &&
				metadata &&
				metadata.playerStates &&
				metadata.playerStates.map(pState => pState.state));

	Engine.GetGUIObjectByName("sgMapPreview").sprite = g_MapCache.getMapPreview(replay.attribs.mapType, replay.attribs.map, replay.attribs?.mapPreview);
	Engine.GetGUIObjectByName("sgMapDescription").caption = g_MapCache.getTranslatedMapDescription(replay.attribs.mapType, replay.attribs.map);

	Engine.GetGUIObjectByName("summaryButton").hidden = !Engine.HasReplayMetadata(replay.directory);
}

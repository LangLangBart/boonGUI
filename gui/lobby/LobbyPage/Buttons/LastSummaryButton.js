/**
 * This class manages the button that allows the player to display the last summary.
 */
class LastSummaryButton
{
	constructor(dialog)
	{
		this.lastSummaryButton = Engine.GetGUIObjectByName("lastSummaryButton");
		this.lastSummaryButton.onPress = this.onPress.bind(this);
		this.lastSummaryButton.caption = translate("Last Score");
		this.lastSummaryButton.enabled = !dialog;
	}

	onPress()
	{
		const replays = Engine.GetReplays(false);
		if (!replays.length)
		{
			messageBox(500, 200, translate("No replays data available."), translate("Error"));
			return;
		}

		const lastReplay = replays.reduce((a, b) => a.attribs.timestamp > b.attribs.timestamp ? a : b);
		if (!lastReplay)
		{
			messageBox(500, 200, translate("No last replay data available."), translate("Error"));
			return;
		}

		const simData = Engine.GetReplayMetadata(lastReplay.directory);
		if (!simData)
		{
			messageBox(500, 200, translate("No summary data available."), translate("Error"));
			return;
		}

		const isReplayCompatible = hasSameMods(lastReplay.attribs.mods, Engine.GetEngineInfo().mods);
		const gameMods = lastReplay.attribs.mods || [];
		if (!isReplayCompatible)
		{
			messageBox(500, 200, `${translate("This summary needs a different sequence of mods:")}\n\n${
				comparedModsString(gameMods, Engine.GetEngineInfo().mods)}`, translate("Incompatible summary"));
			return;
		}

		Engine.LobbySetPlayerPresence("playing");
		Engine.PushGuiPage("page_summary.xml", {
			"sim": simData,
			"gui": {
				"replayDirectory": lastReplay.directory,
				"isInLobby": true,
				"ingame": false,
				"dialog": true
			}
		});
	}
}

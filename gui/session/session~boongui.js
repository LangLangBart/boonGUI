let g_stats;

// keep in sync with GuiInterface~boongui.js
// difference to 0AD's g_WorkerTypes is the exclusion of mercenaries and CitizenSoldier rather than Citizen
var g_boonGUI_WorkerTypes = ["FemaleCitizen", "Trader", "FishingBoat", "CitizenSoldier+!Mercenary"];


autociv_patchApplyN("init", function(target, that, args) {
	const result = target.apply(that, args);
	g_stats = new BoonGUIStats(g_PlayerViewControl);
	return result;
});

function endGame(showSummary)
{
	// Before ending the game
	const replayDirectory = Engine.GetCurrentReplayDirectory();
	const simData = Engine.GuiInterfaceCall("GetReplayMetadata");
	const playerID = Engine.GetPlayerID();

	Engine.EndGame();

	// After the replay file was closed in EndGame
	// Done here to keep EndGame small
	if (!g_IsReplay)
		Engine.AddReplayToCache(replayDirectory);

	if (g_IsController && Engine.HasXmppClient())
		Engine.SendUnregisterGame();

	const summaryData = {
		"sim": simData,
		"gui": {
			"dialog": false,
			"assignedPlayer": playerID,
			"disconnected": g_Disconnected,
			"isReplay": g_IsReplay,
			"replayDirectory": !g_HasRejoined && replayDirectory,
			"replaySelectionData": g_ReplaySelectionData
		}
	};

	if (g_InitAttributes.campaignData)
	{
		const menu = g_CampaignSession.getMenu();
		if (g_InitAttributes.campaignData.skipSummary)
		{
			Engine.SwitchGuiPage(menu);
			return;
		}
		summaryData.campaignData = { "filename": g_InitAttributes.campaignData.run };
		summaryData.nextPage = menu;
	}

	if (showSummary)
		Engine.SwitchGuiPage("page_summary.xml", summaryData);
	else if (g_InitAttributes.campaignData)
		Engine.SwitchGuiPage(summaryData.nextPage, summaryData.campaignData);
	else if (Engine.HasXmppClient())
		Engine.SwitchGuiPage("page_lobby.xml", { "dialog": false });
	else if (g_IsReplay)
		Engine.SwitchGuiPage("page_replaymenu.xml");
	else
		Engine.SwitchGuiPage("page_pregame.xml");
}

function endHome()
{
	// Before ending the game
	const replayDirectory = Engine.GetCurrentReplayDirectory();
	const simData = Engine.GuiInterfaceCall("GetReplayMetadata");
	const playerID = Engine.GetPlayerID();

	Engine.EndGame();

	// After the replay file was closed in EndGame
	// Done here to keep EndGame small
	if (!g_IsReplay)
		Engine.AddReplayToCache(replayDirectory);
	// We have ''g_IsController'' if you are the host, ''g_IsObserver'' if you are just watching and ''g_IsNetworked'' if you are connected via multiplayer. This function is just for when you are connected via multiplayer to exit the XmppClient properly and return to the main page.
	if (g_IsNetworked && Engine.HasXmppClient())
	{
		Engine.SendUnregisterGame();
		Engine.SwitchGuiPage("page_lobby.xml");
	}
	else
	{
		Engine.SwitchGuiPage("page_pregame.xml");
	}
}

/**
 * Called every frame.
 */
function onTick()
{
	if (!g_Settings)
		return;

	const now = Date.now();
	const tickLength = now - g_LastTickTime;
	g_LastTickTime = now;

	handleNetMessages();

	updateCursorAndTooltip();

	if (g_Selection.dirty)
	{

		g_Selection.dirty = false;
		// When selection changed, get the entityStates of new entities
		GetMultipleEntityStates(g_Selection.filter(entId => !g_EntityStates[entId]));

		for (const handler of g_EntitySelectionChangeHandlers)
			handler();

		updateGUIObjects();

		// Display rally points for selected structures.
		Engine.GuiInterfaceCall("DisplayRallyPoint", { "entities": g_Selection.toList() });
	}
	else
	{
		if (g_ShowAllStatusBars && now % g_StatusBarUpdate <= tickLength)
			recalculateStatusBarDisplay();

		Engine.GuiInterfaceCall("DisplayRallyPoint", { "entities": g_Selection.toList(), "watch": true });
	}

	updateTimers();
	Engine.GuiInterfaceCall("ClearRenamedEntities");

	const isPlayingCinemaPath = GetSimState().cinemaPlaying && !g_Disconnected;
	if (isPlayingCinemaPath)
		updateCinemaOverlay();
}

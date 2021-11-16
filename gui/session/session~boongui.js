let g_stats;

autociv_patchApplyN("init", function (target, that, args) {
	let result = target.apply(that, args);
	g_stats = new BoonGUIStats();
	return result;
});

function endGame(showSummary) {
	// Before ending the game
	let replayDirectory = Engine.GetCurrentReplayDirectory();
	let simData = Engine.GuiInterfaceCall("GetReplayMetadata");
	let playerID = Engine.GetPlayerID();

	Engine.EndGame();

	// After the replay file was closed in EndGame
	// Done here to keep EndGame small
	if (!g_IsReplay)
		Engine.AddReplayToCache(replayDirectory);

	if (g_IsController && Engine.HasXmppClient())
		Engine.SendUnregisterGame();

	let summaryData = {
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

	if (g_InitAttributes.campaignData) {
		let menu = g_CampaignSession.getMenu();
		if (g_InitAttributes.campaignData.skipSummary) {
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

function endHome() {
	// Before ending the game
	let replayDirectory = Engine.GetCurrentReplayDirectory();
	let simData = Engine.GuiInterfaceCall("GetReplayMetadata");
	let playerID = Engine.GetPlayerID();

	Engine.EndGame();

	// After the replay file was closed in EndGame
	// Done here to keep EndGame small
	if (!g_IsReplay)
		Engine.AddReplayToCache(replayDirectory);
	// There are 'g_IsController' for when your are the host, 'g_IsObserver' for just watching and 'g_IsNetworked' when connected via Multiplayer. This function is only for when connected to Multiplayer to properly quit the XmppClient and return to the MainPage.
	if (g_IsNetworked && Engine.HasXmppClient()) {
		Engine.SendUnregisterGame();
		Engine.SwitchGuiPage("page_lobby.xml");
	} else {
		Engine.SwitchGuiPage("page_pregame.xml");
	}
}

// This function is basically useless if you only use this mod, but autociv crops the pause overlay to 30% to get around it and I've added his function here and increased the number to 100%. Now the text information from the pause overlay is still displayed correctly, when boths mods (boongui&autociv) are enabled. Just make sure that autociv is activated first and then boongui.
function autociv_patchSession() {
	Engine.GetGUIObjectByName("pauseOverlay").size = "0% 0% 100% 100%"
}

/**
 * Called every frame.
 */
 function onTick()
 {
	 if (!g_Settings)
		 return;
 
	 let now = Date.now();
	 let tickLength = now - g_LastTickTime;
	 g_LastTickTime = now;
 
	 handleNetMessages();
 
	 updateCursorAndTooltip();

	 if (g_Selection.dirty)
	 {
		
		g_Selection.dirty = false;
		// When selection changed, get the entityStates of new entities
		GetMultipleEntityStates(g_Selection.filter(entId => !g_EntityStates[entId]));

		for (let handler of g_EntitySelectionChangeHandlers)
			handler();

		updateGUIObjects();

		// Display rally points for selected structures.
		Engine.GuiInterfaceCall("DisplayRallyPoint", { "entities": g_Selection.toList() });
	 }
	 else
	 {
		if (g_ShowAllStatusBars && now % g_StatusBarUpdate <= tickLength)
		 	recalculateStatusBarDisplay();

		Engine.GuiInterfaceCall("DisplayRallyPoint", { "entities": g_Selection.toList(), watch: true });
	 }
 
	 updateTimers();
	 Engine.GuiInterfaceCall("ClearRenamedEntities");
 
	 let isPlayingCinemaPath = GetSimState().cinemaPlaying && !g_Disconnected;
	 if (isPlayingCinemaPath)
		 updateCinemaOverlay();
 }
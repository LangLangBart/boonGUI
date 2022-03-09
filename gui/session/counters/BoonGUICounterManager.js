// This class manages the little resources panel.
class BoonGUICounterManager
{
	constructor(playerViewControl)
	{
		this.counters = [];
		this.minimapPanel = Engine.GetGUIObjectByName("minimapPanel");
		this.hoverPanel = Engine.GetGUIObjectByName("hoverPanel");
		this.resourceCountsBoon = Engine.GetGUIObjectByName("resourceCountsBoon");
		// StatsOverlay has no size defined, it serves to get the screen size, maybe there is a better way.
		this.stats = Engine.GetGUIObjectByName("Stats");

		this.addCounter("population", CounterPopulation);
		for (const resCode of g_ResourceData.GetCodes())
			this.addCounter(resCode, CounterResource);
		this.minimapPanel.onWindowResized = this.panelSize.bind(this);

		this.init();

		registerSimulationUpdateHandler(this.rebuild.bind(this));
		playerViewControl.registerViewedPlayerChangeHandler(this.rebuild.bind(this));
	}

	addCounter(resCode, type)
	{
		const id = "[" + this.counters.length + "]";
		this.counters.push(
			new type(
				resCode,
				Engine.GetGUIObjectByName("resourceBoon" + id),
				Engine.GetGUIObjectByName("resourceBoon" + id + "_icon"),
				Engine.GetGUIObjectByName("resourceBoon" + id + "_count"),
				Engine.GetGUIObjectByName("resourceBoon" + id + "_stats")));
	}

	init()
	{
		this.panelSize();
		verticallySpaceObjects("resourceCountsBoon", 41);
		for (const counter of this.counters)
		{
			counter.icon.sprite = "stretched:session/icons/resources/" + counter.resCode + ".png";
		}
	}

	panelSize()
	{
		const dimensionsMiniPanel = "0 100%-276 250 100%-26";
		const dimensionsHoverPanel = "0 100%-63 251 100%";
		const screenSizeWidth = this.stats.getComputedSize().right;
		// arbitrarily set to 1600, just felt right
		if (screenSizeWidth >= 1600)
		{
			this.minimapPanel.size = "0 100%-332 300 100%-32";
			this.hoverPanel.size = "0 100%-76 301 100%";
		}
		else
		{
			this.minimapPanel.size = dimensionsMiniPanel;
			this.hoverPanel.size = dimensionsHoverPanel;
		}
		const widthMinimap = this.minimapPanel.getComputedSize().right;
		this.resourceCountsBoon.size = `${widthMinimap} 100%-205 ${widthMinimap + 144} 100%`;
		// Testing for good dimensions, width&height should be the same or very close
		// const testSizes = ["idleWorkerButton", "minimapPanel"];
		// for (let i = 0; i < testSizes.length; i++)
		// {
		// 	const objects = Engine.GetGUIObjectByName(testSizes[i]).getComputedSize();
		// 	const width = objects.right - objects.left;
		// 	const height = objects.bottom - objects.top;
		// 	warn(uneval(`${testSizes[i]}` + "width" + width));
		// 	warn(uneval(`${testSizes[i]}` + "height" + height));
		// }
	}

	rebuild()
	{
		this.resourceCountsBoon.hidden = g_ViewedPlayer <= 0;

		const viewedPlayerState = g_SimState.players[g_ViewedPlayer];
		const diploColor = g_DiplomacyColors.getPlayerColor(g_ViewedPlayer);
		for (const player in g_SimState.players)
			if (player != 0 &&
				player != g_ViewedPlayer &&
				g_Players[player].state != "defeated" &&
				(g_IsObserver ||
					viewedPlayerState.hasSharedLos &&
					g_Players[player].isMutualAlly[g_ViewedPlayer]));

		for (const counter of this.counters)
		{
			const hiddenCounters = g_ViewedPlayer <= 0;
			counter.panel.hidden = hiddenCounters;
			if (!hiddenCounters)
				counter.rebuild(viewedPlayerState, diploColor);
		}
	}
}

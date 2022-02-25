// This class manages the little resources panel.
class BoonGUICounterManager
{
	constructor(playerViewControl)
	{
		this.counters = [];
		this.minimapPanel = Engine.GetGUIObjectByName("minimapPanel");
		this.supplementalSelectionDetails = Engine.GetGUIObjectByName("supplementalSelectionDetails");
		this.resourceCountsBoon = Engine.GetGUIObjectByName("resourceCountsBoon");

		this.addCounter("population", CounterPopulation);
		for (const resCode of g_ResourceData.GetCodes())
			this.addCounter(resCode, CounterResource);
		this.resourceCountsBoon.onWindowResized = this.onWindowResized.bind(this);

		this.init();

		registerSimulationUpdateHandler(this.rebuild.bind(this));
		playerViewControl.registerViewedPlayerChangeHandler(this.rebuild.bind(this));
		this.onWindowResized();
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
		verticallySpaceObjects("resourceCountsBoon", this.counters.length * 8);
		hideRemaining("resourceCountsBoon", this.counters.length);

		for (const counter of this.counters)
		{
			counter.icon.sprite = "stretched:session/icons/resources/" + counter.resCode + ".png";
		}
	}

	onWindowResized()
	{
		const dimensionsCounterPanel = "0 100%-550 140 100%-350";
		const widthMinimap = this.minimapPanel.getComputedSize().right;

		if (Math.abs(widthMinimap - this.supplementalSelectionDetails.getComputedSize().left) >= 100)
			this.resourceCountsBoon.size = `${widthMinimap - 42} 100%-200 ${widthMinimap + 98} 100%`;
		else
			this.resourceCountsBoon.size = dimensionsCounterPanel;
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

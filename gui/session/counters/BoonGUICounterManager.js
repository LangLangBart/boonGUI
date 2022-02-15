/**
 * This class manages the counters in the top panel.
 * For allies who researched team vision and observers,
 * it displays the resources in a tooltip in a player chosen order.
 */
class BoonGUICounterManager
{
	constructor(playerViewControl)
	{
		this.allyPlayerStates = {};

		this.counters = [];
		this.minimapPanel = Engine.GetGUIObjectByName("minimapPanel");
		this.supplementalSelectionDetails = Engine.GetGUIObjectByName("supplementalSelectionDetails");
		this.resourceCountsBoon = Engine.GetGUIObjectByName("resourceCountsBoon");
		// TODO: filter resources depending on JSON file
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
			counter.panel.onPress = this.onPress.bind(this);
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

	onPress()
	{
		Engine.ConfigDB_CreateAndWriteValueToFile(
			"user",
			"gui.session.respoptooltipsort",
			String((+Engine.ConfigDB_GetValue("user", "gui.session.respoptooltipsort") + 2) % 3 - 1),
			"config/user.cfg");
		this.rebuild();
	}

	rebuild()
	{
		const hidden = g_ViewedPlayer <= 0;
		this.resourceCountsBoon.hidden = hidden;
		if (hidden)
			return;

		const viewedPlayerState = g_SimState.players[g_ViewedPlayer];
		this.allyPlayerStates = {};
		for (const player in g_SimState.players)
			if (player != 0 &&
				player != g_ViewedPlayer &&
				g_Players[player].state != "defeated" &&
				(g_IsObserver ||
					viewedPlayerState.hasSharedLos &&
					g_Players[player].isMutualAlly[g_ViewedPlayer]))
				this.allyPlayerStates[player] = g_SimState.players[player];

		this.selectedOrder = +Engine.ConfigDB_GetValue("user", "gui.session.respoptooltipsort");
		this.orderTooltip = this.getOrderTooltip();

		for (const counter of this.counters)
		{
			const hiddenCounters = g_ViewedPlayer <= 0;
			counter.panel.hidden = hiddenCounters;
			if (!hiddenCounters)
				counter.rebuild(viewedPlayerState, this.getAllyStatTooltip.bind(this));
		}
	}

	getOrderTooltip()
	{
		if (!Object.keys(this.allyPlayerStates).length)
			return "";

		return "\n" + sprintf(translate("%(order)s: %(hotkey)s to change order."), {
			"hotkey": setStringTags("\\[Click]", g_HotkeyTags),
			"order":
				this.selectedOrder == 0 ?
					translate("Unordered") :
					this.selectedOrder == 1 ?
						translate("Descending") :
						translate("Ascending")
		});
	}

	getAllyStatTooltip(getTooltipData)
	{
		const tooltipData = [];

		for (const playerID in this.allyPlayerStates)
		{
			const playername = colorizePlayernameHelper("■", playerID) + " " + g_Players[playerID].name;
			tooltipData.push(getTooltipData(this.allyPlayerStates[playerID], playername));
		}

		if (this.selectedOrder)
			tooltipData.sort((a, b) => this.selectedOrder * (b.orderValue - a.orderValue));

		return this.orderTooltip +
			tooltipData.reduce((result, data) =>
				result + "\n" + sprintf(translate(this.AllyStatTooltip), data), "");
	}
}

BoonGUICounterManager.ResourceTitleTags = { "font": "sans-bold-16" };

BoonGUICounterManager.prototype.AllyStatTooltip = markForTranslation("%(playername)s: %(statValue)s");

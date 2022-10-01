class BoonGUIStatsModes
{

	static Modes = [
		{ "type": "production", "icon": "cpu", "title": "Production" },
		{ "type": "units", "icon": "users-three", "title": "Units" },
		{ "type": "idle", "icon": "bed", "title": "Idle Workers" },
		{ "type": "civic_buildings", "icon": "house", "title": "Civic Buildings" },
		{ "type": "military_buildings", "icon": "sword", "title": "Military Buildings" },
		{ "type": "economic_buildings", "icon": "buildings", "title": "Economic Buildings" },
		{ "type": "defensive_buildings", "icon": "shield-checkered", "title": "Defensive Buildings" },
		{ "type": "economy_technologies", "icon": "lightbulb", "title": "Economy Upgrades" },
		{ "type": "military_technologies", "icon": "lightning", "title": "Military Upgrades" },
		{ "type": "other_technologies", "icon": "activity", "title": "Other Upgrades" }
		// { type: "scores", icon: "trophy", title: "Scores" },
	];

	constructor(forceRender)
	{
		const PREFIX = "StatsModes";
		this.root = Engine.GetGUIObjectByName(PREFIX);
		this.modeIndex = 0;

		this.title = Engine.GetGUIObjectByName(`${PREFIX}Title`);
		this.tabButtons = Engine.GetGUIObjectByName(`${PREFIX}TabButtons`);
		this.tabs = this.tabButtons.children.map((tab, index) => new BoonGUIStatsModesTab(tab, index, this));

		this.rowsContainer = Engine.GetGUIObjectByName(`${PREFIX}Rows`);
		this.rows = this.rowsContainer.children.map((row, index) => new BoonGUIStatsModesRow(row, index));

		this.tabButtons.size = "100%-47 26 100% 361";
		this.rowsContainer.size = "0 28 100%-50 100%";

		this.forceRender = forceRender;

		// initate selected tabz1
		this.selectMode(0);
		this.setTopOffset(0);
		g_OverlayCounterManager.registerResizeHandler(this.setTopOffset.bind(this));
	}

	setTopOffset(offset)
	{
		this.root.size = `100%-199 ${155 + offset} 100% 500`;
	}

	selectMode(modeIndex)
	{
		const mode = BoonGUIStatsModes.Modes[modeIndex];
		if (!mode) return;
		this.modeIndex = modeIndex;
		this.tabs.forEach(tab => tab.update(modeIndex));
		this.title.caption = mode.title;
		this.forceRender();
	}

	previousMode(limit = false)
	{
		const next = this.modeIndex - 1;
		const outOfLimit = next < 0;
		if (outOfLimit && limit) return;
		this.selectMode(outOfLimit ? BoonGUIStatsModes.Modes.length - 1 : next);
	}

	nextMode(limit = false)
	{
		const next = this.modeIndex + 1;
		const outOfLimit = next >= BoonGUIStatsModes.Modes.length;
		if (outOfLimit && limit) return;
		this.selectMode(outOfLimit ? 0 : next);
	}

	update(playersStates)
	{
		this.rows.forEach((row, i) => row.update(playersStates[i], BoonGUIStatsModes.Modes[this.modeIndex].type));
	}
}

class BoonGUIStatsModesRow
{
	constructor(row, index)
	{
		const PREFIX = row.name;
		this.root = Engine.GetGUIObjectByName(PREFIX);
		this.root.size = BoonGUIGetRowSize(index, 40);
		this.indicator = Engine.GetGUIObjectByName(`${PREFIX}Indicator`);
		this.indicatorColor = Engine.GetGUIObjectByName(`${PREFIX}IndicatorColor`);
		this.indicatorTeamColor = Engine.GetGUIObjectByName(`${PREFIX}IndicatorTeamColor`);
		this.itemsContainer = Engine.GetGUIObjectByName(`${PREFIX}Items`);
		this.items = this.itemsContainer.children.map((item, indexNumber) => new BoonGUIStatsModesRowItem(item, indexNumber));
		this.indicator.onPress = () => focusCC(true, this.state);
	}

	/**
	 * @private
	 */
	createTooltip(state)
	{
		let tooltip = "";
		const civ = g_CivData[state.civ];
		const Emblem = civ.Emblem.replace(BoonGUIStatsTopPanelRow.Regex_Emblem, "$1");

		tooltip = "";
		let font = state.nick.length >= 17 ? "sans-stroke-16" : "sans-stroke-18";
		tooltip += setStringTags(`${state.nick}\n`, { "color": state.brightenedPlayerColor, font });
		if (state.team != -1)
			tooltip += setStringTags(`Team ${state.team + 1}\n`, { "color": state.brightenedTeamColor });
		tooltip += `[icon="${Emblem}" displace="2 5"] \n`;
		tooltip += `${civ.Name}`;
		const caption = Engine.IsAtlasRunning() ? "" : `${translateAISettings(g_InitAttributes.settings.PlayerData[state.index])}`;
		font = "sans-stroke-14";
		if (caption)
			tooltip += setStringTags(`\n${caption}`, { "color": "210 210 210", font });
		tooltip += setStringTags(`\n${BoonGUIStatsTopPanelRow.prototype.jumpCivicCenterTooltip}`, { font });
		return tooltip;
	}

	update(state, mode)
	{
		this.root.hidden = !state;
		this.state = state;
		if (!state) return;
		this.indicator.tooltip = this.createTooltip(state);
		this.indicatorColor.sprite = `backcolor: ${state.playerColor}`;
		this.indicatorTeamColor.sprite = `backcolor: ${state.teamColor} 170`;
		this.indicatorTeamColor.hidden = state.team == -1;

		this.indicator.tooltip = this.createTooltip(state);
		const items = state.queue.filter(d => d.mode === mode);
		this.items.forEach((item, idx) => {
			item.update(items[idx], state);
		});
	}
}

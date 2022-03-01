class BoonGUIStatsModesRow
{
	constructor(row, index)
	{
		const PREFIX = row.name;
		this.root = Engine.GetGUIObjectByName(PREFIX);
		this.root.size = BoonGUIGetRowSize(index, 40);
		this.indicator = Engine.GetGUIObjectByName(`${PREFIX}Indicator`);
		this.indicatorLabel = Engine.GetGUIObjectByName(`${PREFIX}IndicatorLabel`);
		this.indicatorColor = Engine.GetGUIObjectByName(`${PREFIX}IndicatorColor`);
		this.indicatorTeamColor = Engine.GetGUIObjectByName(`${PREFIX}IndicatorTeamColor`);
		this.indicatorColorDivide = Engine.GetGUIObjectByName(`${PREFIX}IndicatorColorDivide`);
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
		const font = state.name.length >= 16 ? "sans-stroke-16" : "sans-stroke-18";
		tooltip += setStringTags(`${state.name}\n`, { "color": state.playerColor, font });
		if (state.team != -1)
		{
			tooltip += setStringTags(`Team ${state.team + 1}\n`, { "color": state.teamColor });
		}
		tooltip += `[icon="${Emblem}" displace="2 5"] \n`;
		tooltip += `${civ.Name}\n`;
		tooltip += setStringTags("\\[Click]", g_HotkeyTags) + " " + "to focus";

		return tooltip;
	}

	update(state, mode)
	{
		this.root.hidden = !state;
		this.state = state;
		if (!state) return;
		this.indicator.tooltip = this.createTooltip(state);
		this.indicatorColor.sprite = `backcolor: ${state.playerColor}`;
		if (state.team != -1)
		{
			this.indicatorTeamColor.sprite = `backcolor: ${state.teamColor}`;
			this.indicatorLabel.caption = state.team + 1;
		}
		else
			this.indicatorTeamColor.hidden = true;
		if (state.playerColor == state.teamColor)
			this.indicatorColorDivide.hidden = true;
		this.indicator.tooltip = this.createTooltip(state);
		const items = state.queue.filter(d => d.mode === mode);
		this.items.forEach((item, idx) => {
			item.update(items[idx], state);
		});
	}
}

class BoonGUIStatsModesRow
{
	constructor(row, index)
	{
		const PREFIX = row.name;
		this.root = Engine.GetGUIObjectByName(PREFIX);
		this.root.size = BoonGUIGetRowSize(index, 40);
		this.indicator = Engine.GetGUIObjectByName(`${PREFIX}Indicator`);
		this.indicatorColor = Engine.GetGUIObjectByName(`${PREFIX}IndicatorColor`);
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
		const CivName = g_CivData[state.civ].Name;
		tooltip += setStringTags(`${state.name}\n`, { "color": state.playerColor });
		tooltip += setStringTags(`${CivName}\n`, { "color": state.playerColor });

		if (state.team != -1)
		{
			tooltip += setStringTags(`Team ${state.team + 1}\n`, { "color": state.teamColor });
		}

		tooltip += `${headerFont('Economy')} - Phase ${headerFont(state.phase)}\n`;

		const resTypes = ['food', 'wood', 'stone', 'metal'];

		for (const resType of resTypes)
		{
			const count = Math.floor(state.resourceCounts[resType]);
			tooltip += `${resourceIcon(resType)} ${count} `;
		}

		return tooltip;
	}

	update(state, mode)
	{
		this.root.hidden = !state;
		this.state = state;
		if (!state) return;
		this.indicator.tooltip = this.createTooltip(state);
		this.indicatorColor.sprite = `backcolor: ${state.playerColor}`;

		const items = state.queue.filter(d => d.mode === mode);
		this.items.forEach((item, idx) => {
			item.update(items[idx], state);
		});
	}
}

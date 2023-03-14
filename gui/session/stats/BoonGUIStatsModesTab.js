class BoonGUIStatsModesTab
{
	constructor(tab, index, parent)
	{
		const mode = BoonGUIStatsModes.Modes[index] ?? null;
		this.tab = tab;
		this.index = index;
		if (mode)
		{
			tab.hidden = false;
			tab.size = BoonGUIGetRowSize(index, 40);
			const text = Engine.GetGUIObjectByName(`${tab.name}_Text`);
			const icon = Engine.GetGUIObjectByName(`${tab.name}_Icon`);
			icon.sprite = `stretched:color:dimmedWhite:textureAsMask:session/phosphor/${mode.icon}.png`;
			tab.tooltip = colorizeHotkey(`${mode.title} %(hotkey)s`, `boongui.session.stats.mode.${index + 1}`);
			tab.onPress = () => {
				parent.selectMode(index);
			};
		}
	}

	update(modeIndex)
	{
		this.tab.enabled = modeIndex !== this.index;
	}
}

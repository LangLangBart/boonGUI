class BoonGUIStatsModes {

    static Modes = [
        { type: "production", icon: "cpu", title: "Production" },
        { type: "units", icon: "users-three", title: "Units" },
        { type: "civic_buildings", icon: "house", title: "Civic Buildings" },
        { type: "military_buildings", icon: "sword", title: "Military Buildings" },
        { type: "economic_buildings", icon: "buildings", title: "Economic Buildings" },
        { type: "defensive_buildings", icon: "shield-checkered", title: "Defensive Buildings" },
        
        { type: "economy_technologies", icon: "lightbulb", title: "Economy Technologies" },
        { type: "military_technologies", icon: "lightning", title: "Military Technologies" },
        { type: "other_technologies", icon: "activity", title: "Other Technologies" },
        // { type: "scores", icon: "trophy", title: "Scores" },
    ];

    constructor(forceRender) {
        const PREFIX = "StatsModes";
        this.root = Engine.GetGUIObjectByName(PREFIX);
        this.modeIndex = 0;

        this.title = Engine.GetGUIObjectByName(`${PREFIX}Title`);
        this.tabButtons = Engine.GetGUIObjectByName(`${PREFIX}TabButtons`);
        this.tabs = this.tabButtons.children.map((tab, index) => new BoonGUIStatsModesTab(tab, index, this))

        this.rowsContainer = Engine.GetGUIObjectByName(`${PREFIX}Rows`);
        this.rows = this.rowsContainer.children.map((row, index) => new BoonGUIStatsModesRow(row, index));

        this.title.size = '0 0 100%-3 28';
        this.title.sprite = "backcolor: 38 38 38 150";
        
        this.tabButtons.size = '100%-50 30 100% 100%';
        this.rowsContainer.size = '0 30 100%-55 100%';

        this.forceRender = forceRender;
        
        // initate selected tabz1
        this.selectMode(0);
        this.setTopOffset(0);
        g_OverlayCounterManager.registerResizeHandler(this.setTopOffset.bind(this));
    }

	setTopOffset(offset)
	{
        this.root.size = `100%-214 ${155 + offset} 100% 500`;
	}

    selectMode(modeIndex) {
        const mode = BoonGUIStatsModes.Modes[modeIndex];
        if (!mode) return;
        this.modeIndex = modeIndex;
        this.tabs.forEach(tab => tab.update(modeIndex));
        this.title.caption = mode.title;
        this.forceRender();
    }

    previousMode(limit = false) {
        const next = this.modeIndex - 1;
        const outOfLimit = next < 0; 
        if (outOfLimit && limit) return;
        this.selectMode(outOfLimit? BoonGUIStatsModes.Modes.length - 1 : next);
    }

    nextMode(limit = false) {
        const next = this.modeIndex + 1;
        const outOfLimit = next >= BoonGUIStatsModes.Modes.length;
        if (outOfLimit && limit) return;
        this.selectMode(outOfLimit ? 0 : next);
    }

    update(playersStates) {        
        this.rows.forEach((row, i) => row.update(playersStates[i], BoonGUIStatsModes.Modes[this.modeIndex].type));
    }
}

class BoonGUIStatsModesTab {
    constructor(tab, index, parent) {
        const mode = BoonGUIStatsModes.Modes[index] ?? null;
        this.tab = tab;
        this.index = index;
        if (mode) {
            tab.hidden = false;
            tab.size = BoonGUIGetRowSize(index, 40);
            const text = Engine.GetGUIObjectByName(`${tab.name}_Text`);
            const icon = Engine.GetGUIObjectByName(`${tab.name}_Icon`);
            icon.sprite = `stretched:session/phosphor/${mode.icon}.png`;
            tab.tooltip = colorizeHotkey(`${mode.title} %(hotkey)s`, `boongui.session.stats.mode${index + 1}`);
            tab.onPress = () => {
                parent.selectMode(index);
            }
        }
    }
    
    update(modeIndex) {
        this.tab.enabled = modeIndex !== this.index;
    }
}

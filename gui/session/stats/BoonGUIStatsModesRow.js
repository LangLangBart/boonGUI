class BoonGUIStatsModesRow {
    constructor(row, index) {
        const PREFIX = row.name;
        this.root = Engine.GetGUIObjectByName(PREFIX);
        this.root.size = BoonGUIGetRowSize(index, 40);
        this.indicator = Engine.GetGUIObjectByName(`${PREFIX}Indicator`);
        this.indicatorColor = Engine.GetGUIObjectByName(`${PREFIX}IndicatorColor`);
        this.itemsContainer = Engine.GetGUIObjectByName(`${PREFIX}Items`);
        this.items = this.itemsContainer.children.map((item, index) => new BoonGUIStatsModesRowItem(item, index));
        this.indicator.onPress = this.onPress.bind(this);
        this.indicator.onDoublePress = this.onDoublePress.bind(this);

        this.state = null;
    }

    /**
     * @private
     * @param {boolean} move
     */
    press(move) {
        if (this.state == null || this.state.civCentres.length <= 0) return;
        if (!Engine.HotkeyIsPressed("selection.add"))
            g_Selection.reset();

        g_Selection.addList(this.state.civCentres);

        if (move) {
            const entState = GetEntityState(this.state.civCentres[0]);
            Engine.CameraMoveTo(entState.position.x, entState.position.z);
        }
    }

    onPress() {
        // let append = Engine.HotkeyIsPressed("selection.add");
        // let selectall = Engine.HotkeyIsPressed("selection.offscreen");
        this.press(false);
    }

    onDoublePress() {
        this.press(true);
    }

    /**
     * @private
     */
    createTooltip(state) {
        let tooltip = "";
        const CivName = g_CivData[state.civ].Name;
        tooltip += setStringTags(`${state.name}\n`, { color: state.playerColor });
        tooltip += setStringTags(`${CivName}\n`, { color: state.playerColor });

        if (state.team != -1) {
            tooltip += setStringTags(`Team ${state.team + 1}\n`, { color: state.teamColor });
        }

        tooltip += `${headerFont('Economy')} - Phase ${headerFont(state.phase)}\n`;

        const resTypes = ['food', 'wood', 'stone', 'metal'];

        for (let resType of resTypes) {
            const count = Math.floor(state.resourceCounts[resType])
            tooltip += `${resourceIcon(resType)} ${count} `;
        }

        return tooltip;
    }

    update(state, mode) {
        this.root.hidden = !state;
        this.state = state;
        if (!state) return;
        this.indicator.enabled = state.civCentres.length > 0;
        this.indicator.tooltip = this.createTooltip(state);
        this.indicatorColor.sprite = `backcolor: ${state.playerColor}`;

        const items = state.queue.filter(d => d.mode === mode)
        this.items.forEach((item, idx) => {
            item.update(items[idx], state);
        })
    }
}

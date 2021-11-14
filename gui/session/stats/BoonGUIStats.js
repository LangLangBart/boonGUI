class BoonGUIStats {

    constructor() {
        this.root = Engine.GetGUIObjectByName("Stats");
        this.shouldForceRender = true;
        this.statsTopPanel = new BoonGUIStatsTopPanel(() => this.shouldForceRender = true);
        this.statsModes = new BoonGUIStatsModes(() => this.shouldForceRender = true);
        this.lastPlayerLength = null;

        this.resizeInit();
        this.root.hidden = g_IsObserver ? false : true;
        this.root.onTick = this.onTick.bind(this);
    }

    tickPeriod = 6; // blinky needs a nice harmonic blink rate, 10 is too high, 1 would be perfect, but a small tickPeriod kills the performance. 6 seemed to be the best compromise

    toggle() {
        this.root.hidden = !this.root.hidden;
        this.shouldForceRender = true;
    }

    onTick() {
        const forceRender = this.shouldForceRender;
        this.shouldForceRender = false;
        if (this.root.hidden) {
            if (this.lastPlayerLength != 0) this.resize(0);
            return;
        }

        if (forceRender || g_LastTickTime % this.tickPeriod == 0)
            this.update()
    }

    getPlayersStats() {
        const players = Engine.GuiInterfaceCall("boongui_GetOverlay").players ?? [];
        return players
            .filter((state, index, playerStates) => {
                // if (index == 0 && index != g_ViewedPlayer) // Gaia index 0
                //     return false
                if (index == 0)  // Gaia index 0
                    return false

                if (state.state == "defeated" && index != g_ViewedPlayer)
                    return false

                state.playerNumber = index

                if (g_IsObserver || !g_Players[g_ViewedPlayer] || index == g_ViewedPlayer)
                    return true
                if (!playerStates[g_ViewedPlayer].hasSharedLos || !g_Players[g_ViewedPlayer].isMutualAlly[index])
                    return false

                return true
            })
            .sort((a, b) => a.team - b.team);
    }

    playerColor(state) {
        return rgbToGuiColor(g_DiplomacyColors.displayedPlayerColors[state.playerNumber])
    }

    teamColor(state) {
        let teamRepresentatives = {}
        for (let i = 1; i < g_Players.length; ++i) {
            let group = g_Players[i].state == "active" ? g_Players[i].team : "";
            if (group != -1 && !teamRepresentatives[group])
                teamRepresentatives[group] = i
        }
        if (g_IsObserver)
            return rgbToGuiColor(g_Players[teamRepresentatives[state.team] || state.playerNumber].color);
        else
            return "white";
    }

    resizeInit() {
        for (let i in Engine.GetGUIObjectByName("unitGroupPanel").children) {
            const button = Engine.GetGUIObjectByName(`unitGroupButton[${i}]`);
            const icon = Engine.GetGUIObjectByName(`unitGroupIcon[${i}]`);

            let label = Engine.GetGUIObjectByName(`unitGroupLabel[${i}]`);
            button.size = '0 0 50 50';
            icon.size = '3 3 47 47';
            label.font = 'mono-stroke-20';
            label.text_valign = 'top';
            label.text_align = 'right';
        }

        for (let i in Engine.GetGUIObjectByName("panelEntityButtons").children) {
            Engine.GetGUIObjectByName(`panelEntityButton[${i}]`).size = '0 0 60 60';
        }
    }

    resize(length) {
        const PAD = 5;
        this.lastPlayerLength = length;

        let y = (24 * (length + 1)) + 38;
        this.statsTopPanel.root.size = `0 36 1000 ${y}`
        y = this.statsTopPanel.root.size.bottom + PAD;

        const panelEntityButtons = Engine.GetGUIObjectByName("panelEntityButtons");
        panelEntityButtons.size = `2 ${y} 50 ${y + 60}`;
        y = panelEntityButtons.size.bottom + PAD;

        const chatPanel = Engine.GetGUIObjectByName("chatPanel")
        chatPanel.size = `0 ${y} 100% ${y + 150}`;
        y = chatPanel.size.bottom + PAD;

        const unitGroupPanel = Engine.GetGUIObjectByName("unitGroupPanel");
        unitGroupPanel.size = `0 ${y} 100% ${y + 200}`;
    }

    update() {
        Engine.ProfileStart("BoonGUIStats:update");
        const playersStates = this.getPlayersStats();

        for (const state of playersStates) {
            state.teamColor = this.teamColor(state);
            state.playerColor = this.playerColor(state);
        }

        if (this.lastPlayerLength != playersStates.length) {
            this.resize(playersStates.length);
        }

        this.statsTopPanel.update(playersStates);
        this.statsModes.update(playersStates, this.mode);
        Engine.ProfileStop();
    }
}

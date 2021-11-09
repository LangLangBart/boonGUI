class BoonGUIStats {
    constructor() {
        this.BoonGUIStats = Engine.GetGUIObjectByName("BoonGUIStats");
        this.mode = 'units';
        this.forceRender = false;
        this.sections = {
            base: new BoonGUIStatsSectionBase(),
            eco: new BoonGUIStatsSectionEco(),
            units: new BoonGUIStatsSectionUnits(),
            tech: new BoonGUIStatsSectionTech(),
        }
        this.BoonGUIStats.hidden = g_IsObserver ? false : true;
        this.BoonGUIStats.onTick = this.onTick.bind(this)
        this.BoonGUIStats.onPress = this.onPress.bind(this);
    }

    tickPeriod = 6 // blinky needs a nice harmonic blink rate, 10 is too high, 1 would be perfect, but a small tickPeriod kills the performance. 6 seemed to be the best compromise

    onPress() {
        switch (this.mode) {
            case 'units':
                this.mode = 'eco';
                break;
            case 'eco':
                this.mode = 'tech';
                break;
            case 'tech':
                this.mode = 'units';
                break;
        }
        this.forceRender = true;
    }

    onTick() {
        const forceRender = this.forceRender;
        this.forceRender = false;
        if (this.BoonGUIStats.hidden)
            return

        if (forceRender || g_LastTickTime % this.tickPeriod == 0)
            this.update()
    }

    getPlayersStats() {
        return Engine.GuiInterfaceCall("boongui_GetOverlay").players?.filter((state, index, playerStates) =>
        {
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
        });
    }

    playerColor(state) {
        return rgbToGuiColor(g_DiplomacyColors.displayedPlayerColors[state.playerNumber])
    }

    teamColor(state) {
        let teamRepresentatives = {}
		for (let i = 1; i < g_Players.length; ++i)
		{
				let group = g_Players[i].state == "active" ? g_Players[i].team : "";
				if (group != -1 && !teamRepresentatives[group])
                teamRepresentatives[group] = i
        }
		if (g_IsObserver)
        return rgbToGuiColor(g_Players[teamRepresentatives[state.team] || state.playerNumber].color);
        else
        return "white";
    }

    update() {
        Engine.ProfileStart("BoonGUIStats:update");
        const playersStates = this.getPlayersStats();

        for (const state of playersStates) {
            state.teamColor = this.teamColor(state);
            state.playerColor = this.playerColor(state);
        }

        this.sections.base.update(playersStates);
        this.sections.eco.update(playersStates, this.mode == 'eco');
        this.sections.units.update(playersStates, this.mode == 'units');
        this.sections.tech.update(playersStates, this.mode == 'tech');
        this.BoonGUIStats.size = BoonGUIGetSize(playersStates.length);
        Engine.ProfileStop();
    }
}

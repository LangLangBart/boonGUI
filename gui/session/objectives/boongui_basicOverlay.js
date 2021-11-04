var g_InfinitySymbol = translate("\u221E");

function formatStatValue(values)
{
	if (typeof values != "object")
		return values === Infinity ? g_InfinitySymbol : values;
	return ret;
}

/**
 * Returns the nickname without the lobby rating. Found in changeset rP19606 - gui/common/gamedescription.js.
 */
function removeRatingFromNick(playerName)
{
	let result = /^(\S+)\ \((\d+)\)$/g.exec(playerName);

	if (!result)
		return [playerName, ""];

	return [result[1], result[2]];
}

BoonGUIControls.basicOverlay = class
{
    boongui_basicOverlay = Engine.GetGUIObjectByName("boongui_basicOverlay")
    teamNumber = {
        "# ": state => state.team != -1 ? `${state.team + 1}` : "", // Team number  
    }  
    preStats = {
        "Player   ": state => removeRatingFromNick(state.name)[0], // Player name
        " ": state => " ",
        "Rtng ": state => removeRatingFromNick(state.name)[1], // Player Rating
        "Civ": state => this.civs[state.civ]
    }  
    currentPhaseIcon = {
        "   ": state => this.phases[state.phase] ?? 0, // Don't remove the '?? 0' it is needed for GAIA
    }
    stats = {
        " rT": state => state.researchedTechsCount,
        "   P": state => state.popCount,
    }
    blinky = {
        "O": state => "/", 
        "P  ": state =>state.popLimit,
    }
    moreStats = {
        " SUP": state => state.classCounts_Support,
        "|": state => " ",
        "ARMY": state => (state.classCounts_Soldier + state.classCounts_Siege + state.classCounts_Warship),
        " Inf": state => state.classCounts_Infantry,
        " Cav": state => state.classCounts_Cavalry,
        " Cha": state => state.classCounts_Champion,
        " Sie": state => (state.classCounts_Siege + state.classCounts_AfricanElephant + state.classCounts_IndianElephant),
        // looks stupid dividing something by 10 and then multiply it with 10, its just for rounding it X to tenths. Noone gives a fuck if you have 134 wood or 130 wood.
        "   Food": state => Math.floor(state.resourceCounts["food"]/10)*10,
        "   Wood": state => Math.floor(state.resourceCounts["wood"]/10)*10,
        "  Stone": state => Math.floor(state.resourceCounts["stone"]/10)*10,
        "  Metal": state => Math.floor(state.resourceCounts["metal"]/10)*10,
        "  Kil": state => state.enemyUnitsKilledTotal ?? 0,
        " Dth": state => state.unitsLostTotal ?? 0,
        " K/D": state => formatStatValue(limitNumber(state.enemyUnitsKilledTotal / state.unitsLostTotal) || 0),
    }
    cartographyCircle = {
        "  ": state => "●", // Player color, full circle when cartography has been researched or without any mutual allies.
    }
    widths = {} // Will be filled on the constructor
    // lists also all the CIV's and Phases's from Delenda Est
    civs = {"gaia": "GAI", "athen": "ATH", "brit": "BRI", "cart": "CAR", "epir": "EPR", "gaul": "GAU", "goth": "GOT", "han": "HAN", "huns": "HUN", "iber": "IBE", "imp": "IMP", "kush": "KUS", "mace": "MAC", "maur":"MRY", "noba": "NOB", "pers":"PER", "ptol":"PTO", "rome": "ROM", "scyth": "SCY", "sele": "SEL", "spart": "SPA", "sueb": "SUB", "theb": "TEB", "xion":"XON", "zapo": "ZAP"}
    phases = { "imperial": 4, "city": 3, "town":2, "village":1 }
    tickPeriod = 6 // blinky needs a nice harmonic blink rate, 10 is too high, 1 would be perfect, but a small tickPeriod kills the performance. 6 seemed to be the best compromise

    constructor()
    {
        this.boongui_basicOverlay.hidden = g_IsObserver ? false : true;
		this.boongui_basicOverlay.onPress = this.toggle.bind(this);
                    
        for (let name in this.teamNumber)
            this.widths[name] = name.length    
            
        for (let name in this.preStats)
            this.widths[name] = name.length  
      
        for (let name in this.currentPhaseIcon)
            this.widths[name] = name.length
            
        for (let name in this.stats)
            this.widths[name] = name.length

        for (let name in this.blinky)
            this.widths[name] = name.length

        for (let name in this.moreStats)
            this.widths[name] = name.length
            
        for (let name in this.cartographyCircle)
            this.widths[name] = name.length

        this.boongui_basicOverlay.onTick = this.onTick.bind(this)
        this.update()
    }

    toggle()
    {
		this.boongui_basicOverlay.hidden = !this.boongui_basicOverlay.hidden;
    }

    onTick()
    {
        if (this.boongui_basicOverlay.hidden)
            return

        if (g_LastTickTime % this.tickPeriod == 0)
            this.update()
    }

    maxWithIndex(list)
    {
        let index = 0
        let value = list[index]
        for (let i = list.length-1;i>=0 ;i--) if (list[i] > value)
        {
            value = list[i]
            index = i
        }
        return [value, index]
    }
    minWithIndex(list)
    {
        let index = 0
        let value = list[index]
        for (let i = list.length-1;i>=0 ;i--) if (list[i] < value)
        {
            value = list[i]
            index = i
        }
        return [value, index]
    }

    playerColor(state)
    {
        return rgbToGuiColor(g_DiplomacyColors.displayedPlayerColors[state.playerNumber])
    }
	
    teamColor(state)
    {
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

    // Switching to padEnd does not look much better, leave it at padStart for now.
    leftPadTrunc(text, size)
    {
        return text.substring(0, size).padStart(size)
    }
    
    rightPadTrunc(text, size)
    {
        return text.substring(0, size).padEnd(size)
    }

    computeSize(numerOfRows, rowLength)
    {
        return `0 36 11+${10 * rowLength} 36+${20 * numerOfRows +2}`
    }

    update()
    {
        Engine.ProfileStart("BoonGUIControls.basicOverlay:update")
        const playerStates = Engine.GuiInterfaceCall("boongui_GetOverlay").players?.filter((state, index, playerStates) =>
        {
            if (index == 0 && index != g_ViewedPlayer) // Gaia index 0
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

        if (!playerStates)
            return

        let header = Object.keys(this.widths).
            map(row => this.leftPadTrunc(row, this.widths[row])).
            join("")
        const rowLength = header.length
        header = setStringTags(header, { "color": this.HeaderColor })
        header += "\n"
        const values1 = {}
        for (let stat of Object.keys(this.stats))
        {
            let list = playerStates.map(this.stats[stat])
            values1[stat] = {
                "list": list,
                "min": this.minWithIndex(list),
                "max": this.maxWithIndex(list),
            }
        }
        const values2 = {}
        for (let moreStat of Object.keys(this.moreStats))
        {
            let list = playerStates.map(this.moreStats[moreStat])
            values2[moreStat] = {
                "list": list,
                "min": this.minWithIndex(list),
                "max": this.maxWithIndex(list),
            }
        }

        const entries = playerStates.map((state, index) =>
        {      
            const teamNumber = Object.keys(this.teamNumber).
                map(row => this.rightPadTrunc(this.teamNumber[row](state).toString(), this.widths[row])).
                join("")
                 
            const preStats = Object.keys(this.preStats).
                map(row => this.rightPadTrunc(this.preStats[row](state), this.widths[row])).
                join("")
                
            const currentPhaseIcon = Object.keys(this.currentPhaseIcon).
                map(row => this.leftPadTrunc(this.currentPhaseIcon[row](state).toString(), this.widths[row])).
                join("")

            const stats = Object.keys(values1).map(stat =>
            {
                let text = this.leftPadTrunc(values1[stat].list[index].toString(), this.widths[stat])
                switch (index)
                {
                    case values1[stat].max[1]:
                        return setStringTags(text, { "color": this.MaxColor })
                    case values1[stat].min[1]:
                        return setStringTags(text, { "color": this.MinColor })
                    default:
                        return text
                }
            }).join("")
            
            const blinky = Object.keys(this.blinky).
                 map(row => this.leftPadTrunc(this.blinky[row](state).toString(), this.widths[row])).
                join("")
                
            const moreStats = Object.keys(values2).map(moreStat =>
            {
                let text = this.leftPadTrunc(values2[moreStat].list[index].toString(), this.widths[moreStat])
                switch (index)
                {
                    case values2[moreStat].max[1]:
                        return setStringTags(text, { "color": this.MaxColor })
                    case values2[moreStat].min[1]:
                        return setStringTags(text, { "color": this.MinColor })
                    default:
                        return text
                }
            }).join("")
            const cartographyCircle = Object.keys(this.cartographyCircle).
                map(row => this.leftPadTrunc(this.cartographyCircle[row](state), this.widths[row])).
                join("")
            
            if (state.state == "defeated")
                return setStringTags(teamNumber + preStats + " " + (state.phase == "village"  ? '[icon="icon_village_phase" displace="0 4"]' : (state.phase == "town" ? '[icon="icon_town_phase" displace="0 4"]' : (state.phase == "city" ? '[icon="icon_city_phase" displace="0 4"]' : (this.civs[state.civ] == "GAI" ? "  " : '[icon="icon_imperial_phase" displace="0 4"]'))))  + stats + blinky + moreStats + cartographyCircle, { "color": this.TextColorDefeated })

// First team number, some statistics are displayed in the player color, then some icons for the correct civilization phase. GAIA does not get an icon for the phase. Then comes the orange text if the training in one of your buildings is blocked, more stats and finally the cartography circle, which shows with a full circle if you have researched cartography or have no mutual allies. // You will notice it also contains the compatibility for Delenda Est, the imperial phase does not need to be checked if it has started, because the research time for phasing into the imperial phase is zero.
            return setStringTags(teamNumber, { "color": this.teamColor(state) }) + setStringTags(preStats, { "color": this.playerColor(state) }) + " " + (state.phase == "village"  ? (state.phaseTownStarted ? '[icon="icon_town_phase_started" displace="0 4"]' : '[icon="icon_village_phase" displace="0 4"]' ) : (state.phase == "town" ? (state.phaseCityStarted ? '[icon="icon_city_phase_started" displace="0 4"]' : '[icon="icon_town_phase" displace="0 4"]' ) : (state.phase == "city" ? '[icon="icon_city_phase" displace="0 4"]' : (this.civs[state.civ] == "GAI" ? "  " : '[icon="icon_imperial_phase" displace="0 4"]')))) + stats + coloredText(blinky, state.trainingBlocked && (Date.now() % 1000 < 500) ? CounterPopulation.prototype.PopulationAlertColor : CounterPopulation.prototype.DefaultPopulationColor) + moreStats + setStringTags(((state.hasSharedLos || state.numberAllies == 1) ? cartographyCircle : " ○"), { "color": this.playerColor(state) })


        }).join("\n")

        this.boongui_basicOverlay.caption = ""
        this.boongui_basicOverlay.size = this.computeSize(playerStates.length + 1, rowLength)
        this.boongui_basicOverlay.caption = setStringTags(header + entries, {
            "color": this.DefaultTextColor,
            "font": this.DefaultTextFont
        })
        Engine.ProfileStop()
    }
}
// Colors for highlighting the highest/lowest value in each column.
BoonGUIControls.basicOverlay.prototype.MaxColor = "200 220 0";
BoonGUIControls.basicOverlay.prototype.MinColor = "255 100 100";

//Colors for the Headers and the normal text in each column and when defeated.
BoonGUIControls.basicOverlay.prototype.HeaderColor = "225 225 225 190";
BoonGUIControls.basicOverlay.prototype.DefaultTextColor = "250 250 250";
BoonGUIControls.basicOverlay.prototype.TextColorDefeated = "255 255 255 128";

//Font
BoonGUIControls.basicOverlay.prototype.DefaultTextFont = "mono-stroke-14";

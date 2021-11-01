class BoonGUIStatsSectionBase {
    constructor() {
        this.stats = Engine.GetGUIObjectByName("BoonGUIStatsSectionBase");
        const rows = Engine.GetGUIObjectByName("BoonGUIStatsSectionBaseRows").children;
        this.rows = rows.map((row,idx) => new BoonGUIStatsBaseRow(row, idx));

        const icon = Engine.GetGUIObjectByName(`${this.stats.name}_popIcon`);
        icon.sprite = `stretched:session/icons/resources/population_small.png`
    }

    update(playersStates) {
        const scales = {
            popCount: new BoonGUIColorScale(),
            popLimit: new BoonGUIColorScale(),            
        }
        playersStates.forEach((state) => {
            scales.popCount.addValue(state.popCount);
            scales.popLimit.addValue(state.popLimit);
        })
        this.rows.forEach((row, i) => row.update(playersStates[i], scales))
    }
}

class BoonGUIStatsBaseRow {
    constructor(row, index) {
        this.row = row
        this.row.size = BoonGUIGetRowSize(index);
        const name = this.row.name

        this.team = Engine.GetGUIObjectByName(`${name}_team`)
        this.player = Engine.GetGUIObjectByName(`${name}_player`)
        this.rating = Engine.GetGUIObjectByName(`${name}_rating`)
        this.civ = Engine.GetGUIObjectByName(`${name}_civ`)
        this.pop = Engine.GetGUIObjectByName(`${name}_pop`)
        this.los = Engine.GetGUIObjectByName(`${name}_los`);

        this.phaseIcon = Engine.GetGUIObjectByName(`${name}_phaseIcon`)
        this.phaseProgress = Engine.GetGUIObjectByName(`${name}_phaseProgressSlider`)
        this.phaseProgressTop = this.phaseProgress.size.top
        this.phaseProgressHeight = this.phaseProgress.size.bottom - this.phaseProgress.size.top;
    }

    update(state, scales) {
        if (!state) {
            this.row.hidden = true
            return
        }

        const shouldBlink = (Date.now() % 1000 < 500);

        this.row.hidden = false
        this.team.caption = setStringTags(state.team != -1 ? `${state.team + 1}` : "", { color: state.teamColor })
        this.player.caption = setStringTags(state.nick, { color: state.playerColor })
        this.rating.caption = setStringTags(state.rating, { color: state.playerColor })
        this.civ.caption = setStringTags(g_BoonGUICivs[state.civ], { color: state.playerColor })
        
        const phase_city_generic = state.startedResearch['phase_city_generic'];
        const phase_town_generic = state.startedResearch['phase_town_generic'];
        let phase;
        let progress = null;
        if (phase_city_generic) {
            phase = 'phase_city';
            progress = phase_city_generic.progress;
        } else if (state.phase == 'city') {
            phase = 'phase_city';
        } else if (phase_town_generic) {
            progress = phase_town_generic.progress;
            phase = 'phase_town';
        } else if (state.phase == 'town') {
            phase = 'phase_town';
        } else {
            phase = 'phase_village';
        }

        const icon = GetTechnologyData(phase, state.civ).icon
        this.phaseIcon.sprite = `stretched:${this.PortraitDirectory}${icon}`;
        if (progress == null) {
            this.phaseProgress.hidden = true;
        } else {
            this.phaseProgress.hidden = false;
            let size = this.phaseProgress.size;
		    size.top = this.phaseProgressTop + this.phaseProgressHeight * progress;
		    this.phaseProgress.size = size;
        }

        const popCount = state.popCount.toString().padStart(3);
        const popLimit = state.popLimit.toString().padStart(3);

        if (state.trainingBlocked && shouldBlink) {
            this.pop.caption = setStringTags(`${popCount}/${popLimit}`, {
                color: CounterPopulation.prototype.PopulationAlertColor,
            })
        } else {
            const popLimitColor = scales.popLimit.getColor(state.popLimit) ?? 'white';
            const popCountColor = scales.popCount.getColor(state.popCount) ?? 'white';
            this.pop.caption =
                setStringTags(popCount, { color: popCountColor }) + '/' +
                setStringTags(popLimit, { color: popLimitColor });
    
        }


        this.los.caption = setStringTags((state.hasSharedLos || state.numberAllies == 1) ? "●" : "○", {color: state.playerColor});
    }
}

BoonGUIStatsBaseRow.prototype.PortraitDirectory = ResearchProgressButton.prototype.PortraitDirectory;

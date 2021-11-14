class BoonGUIStatsTopPanelRow {
    constructor(row, index) {
        const PREFIX = row.name;
        this.root = Engine.GetGUIObjectByName(PREFIX);
        this.root.size = BoonGUIGetRowSize(index, 24);

        this.border = Engine.GetGUIObjectByName(`${PREFIX}_border`);

        this.team = Engine.GetGUIObjectByName(`${PREFIX}_team`);
        this.player = Engine.GetGUIObjectByName(`${PREFIX}_player`);
        this.rating = Engine.GetGUIObjectByName(`${PREFIX}_rating`);
        this.civ = Engine.GetGUIObjectByName(`${PREFIX}_civ`);
        this.pop = Engine.GetGUIObjectByName(`${PREFIX}_pop`);

        this.economyTechs = Engine.GetGUIObjectByName(`${PREFIX}_economyTechs`);
        this.militaryTechs = Engine.GetGUIObjectByName(`${PREFIX}_militaryTechs`);
        this.femaleCitizen = Engine.GetGUIObjectByName(`${PREFIX}_femaleCitizen`);
        this.infantry = Engine.GetGUIObjectByName(`${PREFIX}_infantry`);
        this.cavalry = Engine.GetGUIObjectByName(`${PREFIX}_cavalry`);

        this.enemyUnitsKilledTotal = Engine.GetGUIObjectByName(`${PREFIX}_enemyUnitsKilledTotal`);
        this.unitsLostTotal = Engine.GetGUIObjectByName(`${PREFIX}_unitsLostTotal`);
        this.killDeathRatio = Engine.GetGUIObjectByName(`${PREFIX}_killDeathRatio`);

        this.counts = {};
        this.gatherers = {};

        for (const resType of g_BoonGUIResTypes) {
            this.counts[resType] = Engine.GetGUIObjectByName(`${PREFIX}_${resType}Counts`);
            this.gatherers[resType] = Engine.GetGUIObjectByName(`${PREFIX}_${resType}Gatherers`);
        }

        this.los = Engine.GetGUIObjectByName(`${PREFIX}_los`);
        this.phaseIcon = Engine.GetGUIObjectByName(`${PREFIX}_phaseIcon`);
        this.phaseProgress = Engine.GetGUIObjectByName(`${PREFIX}_phaseProgressSlider`);

        this.phaseProgressTop = this.phaseProgress.size.top;
        this.phaseProgressHeight = this.phaseProgress.size.bottom - this.phaseProgress.size.top;
    }

    normalizeResource(value) {
        if (value >= 10000) {
            return Math.floor(value / 1000) + setStringTags('k', { font: 'mono-10' });
        } else {
            return Math.floor(value / 10) * 10;
        }
    }

    update(state, scales) {
        this.root.hidden = !state;
        this.state = state;
        if (!state) return;

        const shouldBlink = (Date.now() % 1000 < 500);
        this.border.sprite = `backcolor: ${state.playerColor} 70`;
        this.team.caption = setStringTags(state.team != -1 ? `${state.team + 1}` : "", { color: state.teamColor });
        this.player.caption = setStringTags(state.nick, { color: state.playerColor });
        this.rating.caption = setStringTags(state.rating, { color: state.playerColor });
        this.civ.caption = setStringTags(g_BoonGUICivs[state.civ], { color: state.playerColor });

        let phase;
        let progress = null;
        const phase_city_generic = state.startedResearch['phase_city_generic'];
        const phase_town_generic = state.startedResearch['phase_town_generic'];
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


        this.phaseIcon.sprite = 'stretched:session/portraits/' + GetTechnologyData(phase, state.civ).icon;
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
            const popLimitColor = scales.getColor('popLimit', state.popLimit);
            const popCountColor = scales.getColor('popCount', state.popCount);
            this.pop.caption =
                setStringTags(popCount, { color: popCountColor }) + '/' +
                setStringTags(popLimit, { color: popLimitColor });

        }

        let value, color;
        for (const resType of g_BoonGUIResTypes) {
            value = state.resourceCounts[resType];
            color = scales.getColor(`${resType}Counts`, value);
            this.counts[resType].caption = setStringTags(this.normalizeResource(value), { color });

            value = state.resourceGatherers[resType];
            color = scales.getColor(`${resType}Gatherers`, value, 170);
            this.gatherers[resType].caption = setStringTags(`${value}`, { color });
        }

        value = state.economyTechs;
        color = scales.getColor('economyTechs', value);
        this.economyTechs.caption = setStringTags(value, { color });

        value = state.militaryTechs;
        color = scales.getColor('militaryTechs', value);
        this.militaryTechs.caption = setStringTags(value, { color });

        value = state.classCounts.FemaleCitizen ?? 0;
        color = scales.getColor('femaleCitizen', value);
        this.femaleCitizen.caption = setStringTags(value, { color });

        value = state.classCounts.Infantry ?? 0;
        color = scales.getColor('infantry', value);
        this.infantry.caption = setStringTags(value, { color });

        value = state.classCounts.Cavalry ?? 0;
        color = scales.getColor('cavalry', value);
        this.cavalry.caption = setStringTags(value, { color });

        value = state.enemyUnitsKilledTotal;
        color = scales.getColor('enemyUnitsKilledTotal', value);
        this.enemyUnitsKilledTotal.caption = setStringTags(value, { color });

        value = state.unitsLostTotal;
        color = scales.getColor('unitsLostTotal', value);
        this.unitsLostTotal.caption = setStringTags(value, { color });

        value = state.killDeathRatio;
        color = scales.getColor('killDeathRatio', value);
        let caption = isNaN(value) ? '' : isFinite(value) ? value : translate("\u221E");
        this.killDeathRatio.caption = setStringTags(caption, { color });

        const los = state.hasSharedLos || state.numberAllies == 1 ? "●" : "○";
        this.los.caption = setStringTags(los, { color: state.playerColor });
    }
}

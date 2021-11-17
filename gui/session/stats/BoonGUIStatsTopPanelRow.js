class BoonGUIStatsTopPanelRow {
    constructor(row, index) {
        const PREFIX = row.name;
        this.root = Engine.GetGUIObjectByName(PREFIX);
        this.root.size = BoonGUIGetRowSize(index, 26);

        this.border = Engine.GetGUIObjectByName(`${PREFIX}_border`);

        this.team = Engine.GetGUIObjectByName(`${PREFIX}_team`);
        this.player = Engine.GetGUIObjectByName(`${PREFIX}_player`);
        this.rating = Engine.GetGUIObjectByName(`${PREFIX}_rating`);
        this.civ = Engine.GetGUIObjectByName(`${PREFIX}_civ`);
        this.pop = Engine.GetGUIObjectByName(`${PREFIX}_pop`);

        this.economyTechsCount = Engine.GetGUIObjectByName(`${PREFIX}_economyTechsCount`);
        this.militaryTechsCount = Engine.GetGUIObjectByName(`${PREFIX}_militaryTechsCount`);
        this.femaleCitizen = Engine.GetGUIObjectByName(`${PREFIX}_femaleCitizen`);
        this.infantry = Engine.GetGUIObjectByName(`${PREFIX}_infantry`);
        this.cavalry = Engine.GetGUIObjectByName(`${PREFIX}_cavalry`);

        this.enemyUnitsKilledTotal = Engine.GetGUIObjectByName(`${PREFIX}_enemyUnitsKilledTotal`);
        this.unitsLostTotal = Engine.GetGUIObjectByName(`${PREFIX}_unitsLostTotal`);
        this.killDeathRatio = Engine.GetGUIObjectByName(`${PREFIX}_killDeathRatio`);

        this.resource = {
            counts: {},
            rates: {}
        };

        for (const resType of g_BoonGUIResTypes) {
            this.resource.counts[resType] = Engine.GetGUIObjectByName(`${PREFIX}_${resType}Counts`);
            this.resource.rates[resType] = Engine.GetGUIObjectByName(`${PREFIX}_${resType}Rates`);
        }

        this.los = Engine.GetGUIObjectByName(`${PREFIX}_los`);
        this.phaseIcon = Engine.GetGUIObjectByName(`${PREFIX}_phaseIcon`);
        this.phaseProgress = Engine.GetGUIObjectByName(`${PREFIX}_phaseProgressSlider`);

        this.phaseProgressTop = this.phaseProgress.size.top;
        this.phaseProgressHeight = this.phaseProgress.size.bottom - this.phaseProgress.size.top;
    }

    normalizeResourceCount(value) {
        if (value >= 10000) {
            return Math.floor(value / 1000) + setStringTags('k', { font: 'mono-10' });
        } else {
            return Math.floor(value / 10) * 10;
        }
    }

    normalizeResourceRate(value) {
        if (value >= 10000) {
            return Math.floor(value / 1000) + setStringTags('k', { font: 'mono-10' });
        } else if (value >= 1000) {
            return (value / 1000).toFixed(1) + setStringTags('k', { font: 'mono-10' });
        } else {
            return value;
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
        this.player.tooltip = this.player.caption;
        this.rating.caption = setStringTags(state.rating, { color: state.playerColor });
        this.civ.caption = setStringTags(g_BoonGUICivs[state.civ], { color: state.playerColor });
        this.civ.tooltip = setStringTags(g_CivData[state.civ].Name, { color: state.playerColor });

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

        let value, color, caption, tooltip;
        for (const resType of g_BoonGUIResTypes) {
            value = state.resourceCounts[resType];
            color = scales.getColor(`${resType}Counts`, value);
            caption = this.normalizeResourceCount(value)
            this.resource.counts[resType].caption = setStringTags(caption, { color });

            value = state.resourceRates[resType];
            color = scales.getColor(`${resType}Rates`, value, 180);
            caption = isNaN(value) || value <= 0 ? '' : `+${this.normalizeResourceRate(value)}`
            this.resource.rates[resType].caption = setStringTags(caption, g_IsObserver ? { color } : { color: state.playerColor });

            value = state.resourceGatherers[resType];
            color = scales.getColor(`${resType}Gatherers`, value, 180);
            caption = isNaN(value) || value <= 0 ? 0 : value;
            
            tooltip = "";
            tooltip += `${headerFont(`Economy (${resType})`)}\n`;
            tooltip += `Gatherers: ${setStringTags(caption, { color })}\n`;
            if (state.resourcesTechs[resType].length > 0) {
                tooltip += "\n";
                tooltip += state.resourcesTechs[resType].map(tech => `[icon="icon_${tech}" displace="0 0"]`).join(' ');
            }

            this.resource.counts[resType].tooltip = tooltip;
        }

        value = state.economyTechsCount;
        color = scales.getColor('economyTechsCount', value);
        this.economyTechsCount.caption = setStringTags(value, { color });
        tooltip = "";
        for (const resType of g_BoonGUIResTypes) {
            if (state.resourcesTechs[resType].length > 0) {
                tooltip += `${headerFont(`Economy (${resType})`)}\n\n`;
                tooltip += state.resourcesTechs[resType].map(tech => `[icon="icon_${tech}" displace="0 0"]`).join(' ') + '\n';
            }
        }
        this.economyTechsCount.tooltip = tooltip;


        value = state.militaryTechsCount;
        color = scales.getColor('militaryTechsCount', value);
        this.militaryTechsCount.caption = setStringTags(value, { color });

        tooltip = "";
        if (state.militaryTechs.length > 0) {
            tooltip += `${headerFont(`Military upgrades:`)}\n\n`;
            tooltip += state.militaryTechs.map(tech => `[icon="icon_${tech}" displace="0 0"]`).join('  ') + '\n';
            tooltip += '\n';
        }
        this.militaryTechsCount.tooltip = tooltip;

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
        caption = formatKD(value);
        const font = caption.length >= 4 ? "mono-stroke-12" : "mono-stroke-14";
        this.killDeathRatio.caption = setStringTags(caption, { color, font });

        const los = state.hasSharedLos || state.numberAllies == 1 ? "●" : "○";
        this.los.caption = setStringTags(los, { color: state.playerColor });
    }
}

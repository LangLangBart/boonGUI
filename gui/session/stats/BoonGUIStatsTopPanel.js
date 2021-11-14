class BoonGUIStatsTopPanel {
    
    constructor() {
        const PREFIX = "StatsTopPanel";
        this.root = Engine.GetGUIObjectByName(PREFIX);
        this.headerContainer = Engine.GetGUIObjectByName(`${PREFIX}Header`);
        this.rowsContainer = Engine.GetGUIObjectByName(`${PREFIX}Rows`);
        this.rows = this.rowsContainer.children.map((row, index) => new BoonGUIStatsTopPanelRow(row, index));
        this.headerContainer.size="0 0 100% 25";
        this.rowsContainer.size = "0 25 100% 100%";
        this.scales = new BoonGUIColorScales();
        this.root.sprite = "backcolor: 38 38 38 225";
    }
    
    update(playersStates) {
        this.root.hidden = false;
        this.scales.reset();
        playersStates.forEach((state) => {
            this.scales.addValue('popCount', state.popCount);
            this.scales.addValue('popLimit', state.popLimit);

            this.scales.addValue('economyTechs', state.economyTechs);
            this.scales.addValue('militaryTechs', state.militaryTechs);

            this.scales.addValue('femaleCitizen', state.classCounts.FemaleCitizen ?? 0);
            this.scales.addValue('infantry', state.classCounts.Infantry ?? 0);
            this.scales.addValue('cavalry', state.classCounts.Cavalry ?? 0);

            this.scales.addValue('enemyUnitsKilledTotal', state.enemyUnitsKilledTotal);
            this.scales.addValue('unitsLostTotal', state.unitsLostTotal);
            this.scales.addValue('killDeathRatio', state.killDeathRatio);

            for (const resType of g_BoonGUIResTypes) {
                this.scales.addValue(`${resType}Counts`, state.resourceCounts[resType]);
                this.scales.addValue(`${resType}Gatherers`, state.resourceGatherers[resType]);
            }
        })
        this.rows.forEach((row, i) => row.update(playersStates[i], this.scales))
    }
}

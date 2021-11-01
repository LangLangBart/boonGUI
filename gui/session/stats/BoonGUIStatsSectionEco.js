const BoonGUIResources = ['food','wood','metal','stone']

class BoonGUIStatsSectionEco {
    constructor() {
        this.stats = Engine.GetGUIObjectByName("BoonGUIStatsSectionEco");
        const rows = Engine.GetGUIObjectByName("BoonGUIStatsSectionEcoRows").children;
        this.rows = rows.map((row,idx) => new BoonGUIStatsEcoRow(row, idx));

        for (const resource of BoonGUIResources) {
            const icon = Engine.GetGUIObjectByName(`${this.stats.name}_${resource}Icon`);
            icon.sprite = `stretched:session/icons/resources/${resource}_small.png`
        }
    }

    update(playersStates, active) {
        if (!active) {
            this.stats.hidden = true;
            return;
        }

        this.stats.hidden = false;
        const scales = {
            totalNumberIdleWorkers: new BoonGUIColorScale(),
            totalEconomyScore: new BoonGUIColorScale(),
            percentMapExplored: new BoonGUIColorScale(),
        };

        for (const resource of BoonGUIResources) {
            scales[resource + 'Counts'] = new BoonGUIColorScale();
            scales[resource + 'Gatherers'] = new BoonGUIColorScale();
        }

        playersStates.forEach((state) => {
            scales.totalEconomyScore.addValue(state.totalEconomyScore);
            scales.totalNumberIdleWorkers.addValue(state.totalNumberIdleWorkers);
            scales.percentMapExplored.addValue(state.percentMapExplored);
            for (const resource of BoonGUIResources) {
                scales[resource + 'Counts'].addValue(state.resourceCounts[resource]);
                scales[resource + 'Gatherers'].addValue(state.resourceGatherers[resource]);
            }
        })

        this.rows.forEach((row, i) => row.update(playersStates[i], scales))
    }
}


class BoonGUIStatsEcoRow {
    constructor(row, index) {
        this.row = row
        this.row.size = BoonGUIGetRowSize(index);
        const name = this.row.name
        this.resources = {}

        for (const resource of BoonGUIResources) {
            this.resources[resource + 'Counts'] = Engine.GetGUIObjectByName(`${name}_${resource}Counts`);
            this.resources[resource + 'Gatherers'] = Engine.GetGUIObjectByName(`${name}_${resource}Gatherers`);
        }

        this.score = Engine.GetGUIObjectByName(`${name}_score`);
        this.idle = Engine.GetGUIObjectByName(`${name}_idle`);
        this.explore = Engine.GetGUIObjectByName(`${name}_explore`);
    }

    normalizeResource(value) {
        return Math.floor(value / 10) * 10
    }

    update(state, scales) {
        if (!state) {
            this.row.hidden = true
            return
        }

        this.row.hidden = false
        for (const resource of BoonGUIResources) {
            const cValue = state.resourceCounts[resource];
            const cColor = scales[resource + 'Counts'].getColor(cValue) ?? 'white';
            this.resources[resource + 'Counts'].caption = setStringTags(this.normalizeResource(cValue), { color: cColor })

            const gValue = state.resourceGatherers[resource];
            const gColor = scales[resource + 'Gatherers'].getColor(gValue) ?? 'white';
            this.resources[resource + 'Gatherers'].caption =  '| '+ setStringTags(gValue, { color: gColor })
        }

        let color, value;

        value = state.totalEconomyScore;
        color = scales.totalEconomyScore.getColor(value) ?? 'white';
        this.score.caption = setStringTags(value, { color: color });

        value = state.totalNumberIdleWorkers;
        color = scales.totalNumberIdleWorkers.getColor(value) ?? 'white';
        this.idle.caption = setStringTags(value, { color: color });

        value = state.percentMapExplored;
        color = scales.percentMapExplored.getColor(value) ?? 'white';
        this.explore.caption = setStringTags(value + '%', { color: color });
    }
}

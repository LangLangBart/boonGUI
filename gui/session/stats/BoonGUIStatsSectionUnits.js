const BoonGUIUnits = [
    'Barracks',
    'Cavalry',
    'Champion',
    'Elephant',
    'FemaleCitizen',
    'Field',
    'Infantry',
    'Melee',
    'Ranged',
    'Siege',
    'Stable',
    'Town',
]


class BoonGUIStatsSectionUnits {
    constructor() {
        this.stats = Engine.GetGUIObjectByName("BoonGUIStatsSectionUnits");
        const rows = Engine.GetGUIObjectByName("BoonGUIStatsSectionUnitsRows").children;
        this.rows = rows.map((row,idx) => new BoonGUIStatsSectionUnitsRow(row, idx));
        const buildings = ['field', 'barracks','stable']
        for (const building of buildings) {
            const icon = Engine.GetGUIObjectByName(`${this.stats.name}_${building}Icon`);
            icon.sprite = `stretched:session/portraits/structures/${building}.png`
        }
    }

    update(playersStates, active) {
        if (!active) {
            this.stats.hidden = true;
            return;
        }

        this.stats.hidden = false;

        const scales = {
            kills: new BoonGUIColorScale(),
            deaths: new BoonGUIColorScale(),
            killDeathRatio: new BoonGUIColorScale(),
        }

        for (const unit of BoonGUIUnits) {
            scales[unit] = new BoonGUIColorScale();
        }

        playersStates.forEach((state) => {
            scales.kills.addValue(state.enemyUnitsKilledTotal);
            scales.deaths.addValue(state.unitsLostTotal);
            scales.killDeathRatio.addValue(state.killDeathRatio);
            for(const unit of BoonGUIUnits) {
                scales[unit].addValue(state.classCounts?.[unit] ?? 0);
            }
        })

        this.rows.forEach((row, i) => row.update(playersStates[i], scales))
    }
}


class BoonGUIStatsSectionUnitsRow {
    constructor(row, index) {
        this.row = row;
        this.row.size = BoonGUIGetRowSize(index);
        const name = this.row.name
        this.units = {}

        for (const unit of BoonGUIUnits) {
            this.units[unit] = Engine.GetGUIObjectByName(`${name}_${unit}`)
        }

        this.kills = Engine.GetGUIObjectByName(`${name}_Kills`)
        this.deaths = Engine.GetGUIObjectByName(`${name}_Deaths`)
        this.kd = Engine.GetGUIObjectByName(`${name}_KD`)

        const queue = Engine.GetGUIObjectByName(`${name}_queue`).children
        this.queue = queue.map((obj, idx) => new BoonGUIStatsSectionUnitsRowQueue(obj, idx))
    }

    update(state, scales) {
        if (!state) {
            this.row.hidden = true
            return
        }

        this.row.hidden = false

        for (const unit of BoonGUIUnits) {
            if (this.units[unit] == null) continue;
            const value = state.classCounts?.[unit] ?? 0;
            const color = scales[unit].getColor(value) ?? 'white';
            this.units[unit].caption = setStringTags(value, {color})
        }

        let color, value;

        value = state.enemyUnitsKilledTotal;
        color = scales.kills.getColor(value) ?? 'white';
        this.kills.caption = setStringTags(value, {color})

        value = state.unitsLostTotal;
        color = scales.deaths.getColor(value) ?? 'white';
        this.deaths.caption = setStringTags(value, {color})

        if (isNaN(state.killDeathRatio)) {
            this.kd.caption = '';
        } else if (!isFinite(state.killDeathRatio)) {
            this.kd.caption = translate("\u221E");
        } else {
            value = state.killDeathRatio;
            color = scales.killDeathRatio.getColor(value) ?? 'white';
            this.kd.caption = setStringTags(value, {color})
        }

        this.queue.forEach((obj, idx) => {
            obj.update(state.unitTemplatesQueue[idx])
        })
    }
}


class BoonGUIStatsSectionUnitsRowQueue {
    constructor(item, index) {
        this.item = item
        this.item.size =  BoonGUIGetColSize(index);
        const name = this.item.name

        this.icon = Engine.GetGUIObjectByName(`${name}_icon`)
        this.progressSlider = Engine.GetGUIObjectByName(`${name}_progressSlider`)
        this.count = Engine.GetGUIObjectByName(`${name}_count`)
        this.progressSliderTop = this.progressSlider.size.top
        this.progressSliderHeight = this.progressSlider.size.bottom - this.progressSlider.size.top;        
    }

    update(unit) {
        if (!unit) {
            this.item.hidden = true
            return
        }

        this.item.hidden = false
        const template = GetTemplateData(unit.unitTemplate)
        this.icon.sprite = "stretched:session/portraits/" + template.icon;
        const progress = 1 - (unit.timeRemaining / unit.timeTotal);

        let size = this.progressSlider.size;
        size.top = this.progressSliderTop + this.progressSliderHeight * progress;
        this.progressSlider.size = size;
        this.count.caption = unit.count > 1 ? unit.count : ''
    }
}

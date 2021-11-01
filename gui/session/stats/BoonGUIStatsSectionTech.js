class BoonGUIStatsSectionTech {
    constructor() {
        this.stats = Engine.GetGUIObjectByName("BoonGUIStatsSectionTech");
        const rows = Engine.GetGUIObjectByName("BoonGUIStatsSectionTechRows").children;
        this.rows = rows.map((row,idx) => new BoonGUIStatsSectionTechRow(row, idx));
    }

    update(playersStates, active) {
        if (!active) {
            this.stats.hidden = true;
            return;
        }

        this.stats.hidden = false;
        const scales = {
            rG: new BoonGUIColorScale(),
            rS: new BoonGUIColorScale(),
            rT: new BoonGUIColorScale(),
        };

        playersStates.forEach((state) => {
            scales.rG.addValue(state.researchedGatherTechs);
            scales.rS.addValue(state.researchedSoldierTechs);
            scales.rT.addValue(state.researchedOtherTechs);
        })

        this.rows.forEach((row, i) => row.update(playersStates[i], scales))
    }
}


class BoonGUIStatsSectionTechRow {
    constructor(row, index) {
        this.row = row;
        this.row.size = BoonGUIGetRowSize(index);
        const name = this.row.name;

        this.rG = Engine.GetGUIObjectByName(`${name}_rG`);
        this.rS = Engine.GetGUIObjectByName(`${name}_rS`);
        this.rT = Engine.GetGUIObjectByName(`${name}_rT`);


        const queue = Engine.GetGUIObjectByName(`${name}_queue`).children;
        this.queue = queue.map((obj, idx) => new BoonGUIStatsSectionTechRowQueue(obj, idx));
    }

    update(state, scales) {
        if (!state) {
            this.row.hidden = true
            return
        }

        this.row.hidden = false;

        let value, color;

        value = state.researchedGatherTechs;
        color = color = scales.rG.getColor(value) ?? 'white';
        this.rG.caption = setStringTags(value, { color: color });

        value = state.researchedSoldierTechs;
        color = scales.rS.getColor(value) ?? 'white';
        this.rS.caption = setStringTags(value, { color: color });

        value = state.researchedOtherTechs;
        color = scales.rT.getColor(value) ?? 'white';
        this.rT.caption = setStringTags(value, { color: color });

        this.queue.forEach((obj, idx) => {
            obj.update(state.technologyTemplateQueue[idx], state.civ)
        })
    }
}




class BoonGUIStatsSectionTechRowQueue {
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

    update(unit, civ) {
        if (!unit) {
            this.item.hidden = true
            return
        }

        this.item.hidden = false
        const template = GetTechnologyData(unit.technologyTemplate, civ)
        this.icon.sprite = "stretched:session/portraits/" + template.icon;
        const progress = 1 - (unit.timeRemaining / unit.timeTotal);

        let size = this.progressSlider.size;
        size.top = this.progressSliderTop + this.progressSliderHeight * progress;
        this.progressSlider.size = size;
        this.count.caption = unit.count > 1 ? unit.count : ''
    }
}

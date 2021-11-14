class BoonGUIStatsModesRowItem {
    constructor(item, index) {
        const PREFIX = item.name;
        this.root = Engine.GetGUIObjectByName(PREFIX);
        this.root.size = BoonGUIGetColSize(index, 40, true);

        this.icon = Engine.GetGUIObjectByName(`${PREFIX}Icon`);
        this.count = Engine.GetGUIObjectByName(`${PREFIX}Count`);
        this.progress = Engine.GetGUIObjectByName(`${PREFIX}Progress`);
        this.rank = Engine.GetGUIObjectByName(`${PREFIX}Rank`);

        this.progressLeft = this.progress.size.left;
        this.progressWidth = this.progress.size.right - this.progress.size.left;
        this.root.onPress = this.onPress.bind(this);
        this.root.onPressRight = this.onPressRight.bind(this);
        this.item = null;
        this.state = null;
    }

    onPress() {
        if (this.item == null || this.item.entity.length <= 0) return
        if (!Engine.HotkeyIsPressed("selection.add"))
            g_Selection.reset();

        let entities = [...new Set(this.item.entity.map(e => getEntityOrHolder(e)))];
        g_Selection.addList(entities);

        const entState = GetEntityState(entities[0]);
        Engine.CameraMoveTo(entState.position.x, entState.position.z);
    }

    onPressRight() {
        if (this.item == null || this.state == null) return;
        showTemplateDetails(this.item.template, this.state.civ);
    }

    update(item, state) {
        this.item = item;
        this.state = state;
        this.root.hidden = !item;

        if (!item) return;

        this.icon.hidden = false;

        let template;
        switch (item.templateType) {
            case "technology":
                template = GetTechnologyData(item.template, state.civ);
                break;
            case "unit":
                template = GetTemplateData(item.template);
                break;
            default:
                this.icon.hidden = true;
                return;
        }

        // if (item.template.endsWith("_b")) {
        //     this.rank.sprite = 'stretched:session/icons/ranks/Basic.png'
        //     this.rank.hidden = false;
        // } else if (item.template.endsWith("_a")) {
        //     this.rank.sprite = 'stretched:session/icons/ranks/Advanced.png'
        //     this.rank.hidden = false;
        // } else if (item.template.endsWith("_e")) {
        //     this.rank.sprite = 'stretched:session/icons/ranks/Elite.png'
        //     this.rank.hidden = false;
        // } else {
        //     this.rank.hidden = true;
        // }

        let size = this.progress.size;
        size.left = this.progressLeft + this.progressWidth * (item.progress / item.entity.length);
        this.progress.sprite = `backcolor: ${state.playerColor}`;

        this.progress.size = size;
        this.progress.hidden = item.mode !== 'Production';

        this.count.caption = item.count > 1 ? item.count : '';
        this.icon.sprite = "stretched:session/portraits/" + template.icon;

        this.root.tooltip = [
            getEntityNames(template),
            showTemplateViewerOnRightClickTooltip()
        ].join('\n');
    }
}
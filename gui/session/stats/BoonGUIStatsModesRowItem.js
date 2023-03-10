class BoonGUIStatsModesRowItem {
	constructor(item, index) {
		const PREFIX = item.name;
		this.root = Engine.GetGUIObjectByName(PREFIX);
		this.root.size = BoonGUIGetColSize(index, 40, true);

		this.icon = Engine.GetGUIObjectByName(`${PREFIX}Icon`);
		this.count = Engine.GetGUIObjectByName(`${PREFIX}Count`);
		this.progress = Engine.GetGUIObjectByName(`${PREFIX}Progress`);

		this.progressLeft = this.progress.size.left;
		this.progressWidth = this.progress.size.right - this.progress.size.left;
		this.root.onPress = this.onPress.bind(this);
		this.root.onDoublePress = this.onDoublePress.bind(this);
		this.root.onPressRight = this.onPressRight.bind(this);
		this.item = null;
		this.state = null;
	}

	/**
     * @private
     * @param {boolean} move
     */
	press(move) {
		if (this.item == null || this.item.entity.length <= 0) return;
		if (!Engine.HotkeyIsPressed("selection.add"))
			g_Selection.reset();

		const entities = [...new Set(this.item.entity.map(e => getEntityOrHolder(e)))];
		g_Selection.addList(entities);

		if (move)
		{
			const entState = GetEntityState(entities[0]);
			if (entState)
				Engine.CameraMoveTo(entState.position.x, entState.position.z);
		}
	}

	onDoublePress() {
		this.press(true);
	}

	onPress() {
		this.press(false);
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
		switch (item.templateType)
		{
		case "technology":
			template = GetTechnologyData(item.template, state.civ);
			break;
		case "unit":
			template = GetTemplateData(item.template);
			break;
		default:
			this.root.hidden = true;
			return;
		}

		const size = this.progress.size;
		size.left = this.progressLeft + this.progressWidth * (item.progress / item.entity.length);
		this.progress.sprite = `backcolor: ${state.playerColor}`;

		this.progress.size = size;
		this.progress.hidden = item.mode !== "production";
		this.count.caption = item.count > 1 ? item.count : "";
		this.icon.sprite = `stretched:session/portraits/${template.icon}`;

		this.root.tooltip = setStringTags(`${state.nick}\n`, { "color": state.brightenedPlayerColor, "font": "sans-stroke-18" });
		this.root.tooltip += [
			getEntityNamesFormatted(template),
			getVisibleEntityClassesFormatted(template),
			getEntityTooltip(template),
			setStringTags(showTemplateViewerOnRightClickTooltip(), { "font": "sans-stroke-14" })
		].filter(tip => tip).join("\n");
	}
}

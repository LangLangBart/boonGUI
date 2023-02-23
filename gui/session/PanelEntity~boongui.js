/**
 * The class BoonGUIPanelEntity modifies the "constructor" and the "update()" method
 * of the PanelEntity class so that the background is displayed in player colors.
 */
class BoonGUIPanelEntity extends PanelEntity
{
	constructor(selection, entityID, buttonID, orderKey)
	{
		super(selection, entityID, buttonID, orderKey);
		this.panelEntityBackground = Engine.GetGUIObjectByName(`panelEntityBackground[${buttonID}]`);
	}

	update(i, reposition)
	{
		// TODO: Instead of instant position changes, animate button movement.
		if (reposition)
			setPanelObjectPosition(this.panelEntButton, i, Infinity);

		const entityState = GetEntityState(this.entityID);
		const template = GetTemplateData(entityState.template);
		this.updateHitpointsBar(entityState);
		this.updateCapturePointsBar(entityState);
		this.panelEntityBackground.sprite =
			`color:${g_DiplomacyColors.getPlayerColor(entityState.player, 128)}`;

		this.panelEntButton.tooltip =
			`${this.nameTooltip +
			this.Tooltips.map(tooltip => tooltip(entityState)).filter(tip => tip).join("\n")}\n${getAurasTooltip(template)}`;
	}
}
PanelEntity = BoonGUIPanelEntity;

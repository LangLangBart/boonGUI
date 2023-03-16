function _setHoverHighlight(ents, enabled, validAction)
{
	if (ents.length)
		Engine.GuiInterfaceCall("HoverSelectionHighlight", { "entities": ents, enabled, validAction });
}

EntitySelection.prototype.getFirstSelected = function() {
	for (const ent of this.selected)
	{
		this.selected.delete(ent);
		this.selected.add(ent);
		return ent;
	}

	return undefined;
};

EntitySelection.prototype.setHighlightList = function(entities)
{
	const highlighted = new Set();
	const ents = this.addFormationMembers(entities);
	for (const ent of ents)
		highlighted.add(ent);

	const removed = [];
	const added = [];

	// Remove highlighting for the old units that are no longer highlighted
	// (excluding ones that are actively selected too).
	for (const ent of this.highlighted)
		if (!highlighted.has(ent) && !this.selected.has(ent))
			removed.push(ent);

	// Add new highlighting for units that aren't already highlighted.
	for (const ent of ents)
		if (!this.highlighted.has(ent) && !this.selected.has(ent))
			added.push(ent);

	_setHighlight(removed, 0, false);
	_setStatusBars(removed, false);

	_setHighlight(added, g_HighlightedAlpha, true);
	_setStatusBars(added, true);

	if(this.selected.size && g_ViewedPlayer)
	{
		//  If at least one unit is selected, it will determine if that unit can interact with an entity that the mouse is hovering over, e.g. a selected cavalry can't interact with a berry bush, resulting in no highlighting.
		const selectedUnitOwned = GetEntityState(this.getFirstSelected())?.player === g_ViewedPlayer;
		let validAction = false;
		if (selectedUnitOwned)
			for (const action of g_UnitActionsSortedKeys)
				if (g_UnitActions[action].actionCheck)
				{
					const r = g_UnitActions[action].actionCheck([...highlighted][0], this.toList());
					if (r)
					{
						validAction = !!r?.cursor;
						break;
					}
				}
		// Any entity the mouse pointer hovers over can potentially be highlighted, the "validAction" is limited to what makes sense to be highlighted, you don't want the feature to be too distracting for the player.
		_setHoverHighlight([...this.highlighted], true, validAction);
		// Venn diagram: relative complement, difference set of B and A, is the set of elements in B that are not contained in A.
		// [1,2,3,4,5] \ [2,4,6] => [1,3,5]
		// [2,4,6] \ [1,2,3,4,5] => [6]
		// Reset all entities over which the mouse pointer no longer hovers.
		_setHoverHighlight([...this.highlighted].filter(b => !highlighted.has(b)), false, validAction);
	}

	this.highlighted = highlighted;
};

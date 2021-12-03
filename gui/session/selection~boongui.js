EntitySelection.prototype.getFirstSelected = function() {
	for (const ent of this.selected)
	{
		this.selected.delete(ent);
		this.selected.add(ent);
		return ent;
	}

	return undefined;
};

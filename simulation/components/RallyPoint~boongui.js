RallyPoint.prototype.AddPosition = function(x, z)
{
	this.pos.push({
		"x": x,
		"z": z
	});

	Engine.QueryInterface(SYSTEM_ENTITY, IID_GuiInterface).ChangedRallyPoints.add(this.entity);
};

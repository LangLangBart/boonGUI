let lastBeepTime = 1;
MiniMapIdleWorkerButton.prototype.rebuild = function()
{
	const totalNumberIdleWorkers = Engine.GuiInterfaceCall("FindIdleUnits", {
		"viewedPlayer": g_ViewedPlayer,
		"idleClasses": this.idleClasses,
		"excludeUnits": []
	}).length;
	this.idleWorkerButton.enabled = totalNumberIdleWorkers > 0;
	const nowTime = Date.now();
	const waitedTime = nowTime - lastBeepTime;
	if(this.idleWorkerButton.enabled) {
		const multiplier = (totalNumberIdleWorkers > 9) ? 9 : totalNumberIdleWorkers;
		if( waitedTime * multiplier > 500) {
			Engine.PlayUISound("audio/interface/alarm/alarm_invalid_building_placement_01.ogg", false);
			lastBeepTime = Date.now();
		}
	}
	Engine.GetGUIObjectByName("totalNumberIdleWorkers").caption = this.idleWorkerButton.enabled ? totalNumberIdleWorkers : "";
};

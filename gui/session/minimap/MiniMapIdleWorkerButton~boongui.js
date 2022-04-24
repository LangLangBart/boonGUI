MiniMapIdleWorkerButton.prototype.rebuild = function()
{
	const totalNumberIdleWorkers = Engine.GuiInterfaceCall("FindIdleUnits", {
		"viewedPlayer": g_ViewedPlayer,
		"idleClasses": this.idleClasses,
		"excludeUnits": []
	}).length;
	this.idleWorkerButton.enabled = totalNumberIdleWorkers > 0;


	
	if(Engine.ConfigDB_GetValue("user", "boongui.showduration") == "true") {
		const waitedTime = Date.now() - this.lastBeepTime;
		if (this.idleWorkerButton.enabled && waitedTime * Math.min(totalNumberIdleWorkers, 5) > 10000) {
			Engine.PlayUISound("audio/interface/alarm/alarm_no_idle_unit_01.ogg", false);
			this.lastBeepTime = Date.now();
		}
	}
	Engine.GetGUIObjectByName("totalNumberIdleWorkers").caption = this.idleWorkerButton.enabled ? totalNumberIdleWorkers : "";
};

MiniMapIdleWorkerButton.prototype.lastBeepTime = 0;

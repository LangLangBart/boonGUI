// let beepIdleOn = (beepIdleOn === null) ? Engine.ConfigDB_GetValue("user", "boongui.showduration") == "true" : beepIdleOn ;
//if(beepIdleOn === null){
let beepIdleOn = Engine.ConfigDB_GetValue("user", "boongui.beepIdleDefault") == "true";
	// Engine.ConfigDB_GetValue("user", "boongui.showduration") == "true"
//}



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
		// this.idleWorkerButton.enabled &&
		if ( beepIdleOn && waitedTime * Math.min(totalNumberIdleWorkers, 5) > 1000) {
			Engine.PlayUISound("audio/interface/alarm/beep_idle_02.ogg", false);
			this.lastBeepTime = Date.now();
		}
	}
	Engine.GetGUIObjectByName("totalNumberIdleWorkers").caption = this.idleWorkerButton.enabled ? totalNumberIdleWorkers : "";
};

if(Engine.ConfigDB_GetValue("user", "boongui.beepIdleDefault") == "true")
{
	MiniMapIdleWorkerButton.prototype.onKeyDown = function()
	{
		Engine.PlayUISound("audio/interface/alarm/beep_idle_01.ogg", false); // not really needet
		beepIdleOn = !beepIdleOn;
		if(beepIdleOn)
			Engine.ConfigDB_GetValue("user", "boongui.beepIdle") == "true";
		else
			Engine.ConfigDB_GetValue("user", "boongui.beepIdle") == "false"
	};
};



MiniMapIdleWorkerButton.prototype.lastBeepTime = 0;
if(beepIdleOn)
	MiniMapIdleWorkerButton.prototype.Tooltip = markForTranslation("idle worker\nNumber of idle workers.\nbeepIdle toggle (On/Off)");





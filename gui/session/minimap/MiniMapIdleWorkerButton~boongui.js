MiniMapIdleWorkerButton.prototype.rebuild = function()
{
	const totalNumberIdleWorkers = Engine.GuiInterfaceCall("FindIdleUnits", {
		"viewedPlayer": g_ViewedPlayer,
		"idleClasses": this.idleClasses,
		"excludeUnits": []
	}).length;
	this.idleWorkerButton.enabled = totalNumberIdleWorkers > 0;
	Engine.GetGUIObjectByName("totalNumberIdleWorkers").caption = totalNumberIdleWorkers ? coloredText(totalNumberIdleWorkers, "red") : "";
};

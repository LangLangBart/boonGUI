GameSettingsController.prototype.switchToLoadingPage = function(attributes)
{
	Engine.SwitchGuiPage("page_loading.xml", {
		"attribs": attributes?.initAttributes || g_GameSettings.toInitAttributes(),
		"playerAssignments": g_PlayerAssignments
	});
	Engine.PlayUISound("audio/interface/ui/switchToLoadingPage.ogg", false);
};

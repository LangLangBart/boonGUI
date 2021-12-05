GameSettingsController.prototype.switchToLoadingPage = function(attributes)
{
	Engine.SwitchGuiPage("page_loading.xml", {
		"attribs": attributes?.initAttributes || g_GameSettings.toInitAttributes(),
		"playerAssignments": g_PlayerAssignments
	});
	if (g_IsNetworked)
		Engine.PlayUISound("audio/interface/ui/switchToLoadingPage.ogg", false);
};


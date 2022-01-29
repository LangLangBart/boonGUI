NetworkStatusOverlay.prototype.constructor = function()
{
	this.netStatus = Engine.GetGUIObjectByName("netStatus");
	this.loadingClientsText = Engine.GetGUIObjectByName("loadingClientsText");

	Engine.GetGUIObjectByName("disconnectedExitButton").onPress = () => { endGame(true); };

	registerNetworkStatusChangeHandler(this.onNetStatusMessage.bind(this));
	registerClientsLoadingHandler(this.onClientsLoadingMessage.bind(this));
};

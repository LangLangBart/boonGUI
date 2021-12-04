ReturnQuestion.prototype.Buttons = [
	{
		"caption": translate("I will return"),
		"onPress": () => { endGame(false); }
	},
	{
		"caption": translate("I resign"),
		"onPress": () => {
			Engine.PostNetworkCommand({
				"type": "resign"
			});
		}
	}
];

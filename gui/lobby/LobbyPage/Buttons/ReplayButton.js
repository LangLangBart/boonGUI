/**
 * This class manages the button that allows the player to display the replay page.
 */
class ReplayButton
{
	constructor(dialog)
	{
		this.replayButton = Engine.GetGUIObjectByName("replayButton");
		this.replayButton.onPress = this.onPress.bind(this);
		this.replayButton.caption = translate("Replays");
		this.replayButton.enabled = !dialog;
	}

	onPress()
	{
		Engine.LobbySetPlayerPresence("playing");
		Engine.PushGuiPage("page_replaymenu.xml",
			{
				"replaySelectionData": {
					"filters": {
						"compatibility": false,
						"singleplayer": "Multiplayer"
					}
				}
			});
	}
}

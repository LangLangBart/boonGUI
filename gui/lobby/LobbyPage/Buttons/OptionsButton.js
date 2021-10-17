/**
 * This class manages the button that allows the player to display the options page.
 */
class OptionsButton
{
	constructor()
	{
		this.optionsButton = Engine.GetGUIObjectByName("optionsButton");
		this.optionsButton.onPress = this.onPress.bind(this);
		this.optionsButton.caption = translate("Options");
	}

	onPress()
	{
		Engine.PushGuiPage("page_options.xml");
	}
}

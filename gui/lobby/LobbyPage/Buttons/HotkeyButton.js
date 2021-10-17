/**
 * This class manages the button that allows the player to display the hotkey page.
 */
class HotkeyButton
{
	constructor()
	{
		this.hotkeyButton = Engine.GetGUIObjectByName("hotkeyButton");
		this.hotkeyButton.onPress = this.onPress.bind(this);
		this.hotkeyButton.caption = translate("Hotkeys");
	}

	onPress()
	{
		Engine.PushGuiPage("hotkeys/page_hotkeys.xml");
	}
}

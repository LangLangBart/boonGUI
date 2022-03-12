/**
 * Open the Stats.
 */
class MiniMapScoreButton
{
	constructor()
	{
		this.scoreButton = Engine.GetGUIObjectByName("scoreButton");
		registerHotkeyChangeHandler(this.onHotkeyChange.bind(this));
	}

	onHotkeyChange()
	{
		this.scoreButton.tooltip =
			colorizeHotkey("%(hotkey)s" + " ", "boongui.session.stats.toggle") + "Toggle the top panel." + coloredText("\nLow performance gain when hidden.", "red");
	}
}

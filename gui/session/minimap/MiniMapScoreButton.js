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
			`${colorizeHotkey("%(hotkey)s", "boongui.session.stats.toggle")} Toggle the top panel.\n${coloredText("Low performance gain when hidden.", "red")}`;
	}
}

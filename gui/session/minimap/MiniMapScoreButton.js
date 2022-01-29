/**
 * Open the Stats.
 */
class MiniMapScoreButton
{
	constructor()
	{
		this.scoreButton = Engine.GetGUIObjectByName("scoreButton");
		this.scoreButton.onMouseLeftPress = this.onKeyDown.bind(this);
		registerHotkeyChangeHandler(this.onHotkeyChange.bind(this));
	}

	onHotkeyChange()
	{
		this.scoreButton.tooltip =
			colorizeHotkey("%(hotkey)s" + " ", "boongui.session.stats.toggle") +
			translate(this.Tooltip) + setStringTags("\nLow performance gain when hidden.", { "color": "red", "font": "sans-bold-stroke-13" });
	}

	onKeyDown()
	{
		g_stats.toggle();
	}
}

MiniMapScoreButton.prototype.Tooltip = markForTranslation("Toggle Stats Overlay");

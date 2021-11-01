/**
 * Open the Ststs.
 */
class MiniMapScoreButton
{
	constructor()
	{
		this.scoreButton = Engine.GetGUIObjectByName("scoreButton");
		this.scoreButton.onMouseLeftPress = this.onKeyDown.bind(this);
		this.BoonGUIStats = Engine.GetGUIObjectByName("BoonGUIStats");
		registerHotkeyChangeHandler(this.onHotkeyChange.bind(this));
	}

	onHotkeyChange()
	{
		this.scoreButton.tooltip =
			colorizeHotkey("%(hotkey)s" + " ", "boongui.session.basicOverlay") +
			translate(this.Tooltip);
	}
	
	onKeyDown()
	{
		this.BoonGUIStats.hidden = !this.BoonGUIStats.hidden;
	}
}

MiniMapScoreButton.prototype.Tooltip = markForTranslation("Toggle Stats Overlay");
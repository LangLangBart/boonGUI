/**
 * Open the Ststs.
 */
class MiniMapScoreButton
{
	constructor()
	{
		this.scoreButton = Engine.GetGUIObjectByName("scoreButton");
		this.scoreButton.onMouseLeftPress = this.onKeyDown.bind(this);
		this.boongui_basicOverlay = Engine.GetGUIObjectByName("boongui_basicOverlay");
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
		this.boongui_basicOverlay.hidden = !this.boongui_basicOverlay.hidden;
	}
}

MiniMapScoreButton.prototype.Tooltip = markForTranslation("Toggle Stats Overlay");
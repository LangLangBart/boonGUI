/**
 * Diplomacy button sprites cannot be defined in xml part, because they have on and off status.
 */
MiniMapDiplomacyColorsButton.prototype.onDiplomacyColorsChange = function(enabled)
{
	this.diplomacyColorsButton.sprite =
				enabled ? this.SpriteEnabled : this.SpriteDisabled;

	this.diplomacyColorsButton.sprite_over =
				enabled ? this.SpriteEnabledOver : this.SpriteDisabledOver;
};

MiniMapDiplomacyColorsButton.prototype.Tooltip = markForTranslation("Toggle Diplomacy Colors");

MiniMapDiplomacyColorsButton.prototype.SpriteEnabled = "MinimapDiplomacyOnButtonNormal";
MiniMapDiplomacyColorsButton.prototype.SpriteDisabled = "MinimapDiplomacyOffButtonNormal";

MiniMapDiplomacyColorsButton.prototype.SpriteEnabledOver = "MinimapDiplomacyOnButtonBright";
MiniMapDiplomacyColorsButton.prototype.SpriteDisabledOver = "MinimapDiplomacyOffButtonBright";
MiniMapDiplomacyColorsButton.prototype.SpriteMask = "texture:session/minimap_buttons/minimap-diplomacy-on.png";

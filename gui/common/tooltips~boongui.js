//keep this in sync with Player~boongui.js
// used in Gamesetup to have the same colors as in the game
var g_vividColorsGamesetup = {
	"vividBlue": { "r": 0, "g": 160, "b": 255 },
	"vividRed": { "r": 255, "g": 0, "b": 0 },
	"vividGreen": { "r": 0, "g": 255, "b": 0 },
	"vividYellow": { "r": 255, "g": 255, "b": 0 },
	"vividCyan": { "r": 0, "g": 255, "b": 255 },
	"vividPurple": { "r": 157, "g": 97, "b": 255 },
	"vividOrange": { "r": 255, "g": 153, "b": 0 },
	"vividPink": { "r": 255, "g": 50, "b": 255 }
};

// It compares the old color with the  g_vividColorsGamesetup colors
function makeColorsVivid(oldColor) {
  if (oldColor == g_Settings.PlayerDefaults[1].Color)
      return g_vividColorsGamesetup.vividBlue;
  if (oldColor == g_Settings.PlayerDefaults[2].Color)
      return g_vividColorsGamesetup.vividRed;
  if (oldColor == g_Settings.PlayerDefaults[3].Color)
      return g_vividColorsGamesetup.vividGreen;
  if (oldColor == g_Settings.PlayerDefaults[4].Color)
      return g_vividColorsGamesetup.vividYellow;
  if (oldColor == g_Settings.PlayerDefaults[5].Color)
      return g_vividColorsGamesetup.vividCyan;
  if (oldColor == g_Settings.PlayerDefaults[6].Color)
      return g_vividColorsGamesetup.vividPurple;
  if (oldColor == g_Settings.PlayerDefaults[7].Color)
      return g_vividColorsGamesetup.vividOrange;
  if (oldColor == g_Settings.PlayerDefaults[8].Color)
      return g_vividColorsGamesetup.vividPink;
  else 
  return oldColor;
}

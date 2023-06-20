/**
 * Print the shorthand identifier of a mod.
 */
function modToString(mod)
{
	return sprintf(translateWithContext("Mod comparison", "%(mod)s (%(version)s)"), {
		"mod": mod.name,
		"version": mod.version
	});
}

/**
 * --------------------------------------
 *  boonGUI: Helper functions
 * --------------------------------------
 */

// Idea of @nani's autociv mod, makes it much easier to load additional code for this mod,
//  without copying all the legacy code into the mod.

const autociv_patchApplyN = (...args) => {
	const [method, patch] = args;
	global[method] = new Proxy(global[method], { "apply": patch });
};

const boonGUI_ColorsSeenBefore = new Map();

/**
 * Some text colors must become brighter so that they are readable on dark backgrounds.
 * Modified version from gui/lobby/LobbyPage/PlayerColor.GetPlayerColor
 * Additional check for "perceived brightness", if the color is already bright enough don't change it,
 * otherwise go up in small incremental steps till it is bright enough.
 * https://www.w3.org/TR/AERT/#color-contrast
 * @param   {string}  color  				string of rgb color, e.g. "10 10 190" ("Dark Blue")
 * @param   {number}  brightnessThreshold 	Value when a color is considered bright enough; Range:0-255
 * @return  {string}        				string of brighter rgb color, e.g. "100 100 248" ("Blue")
 */
function brightenedColor(color, brightnessThreshold = 115)
{
	// check if a cached version is already available
	const key = `${color} ${brightnessThreshold}`;
	if (!boonGUI_ColorsSeenBefore.has(key))
	{
		let [r, g, b] = color.split(" ").map(x => +x);
		let i = 0;
		while (r * 0.299 + g * 0.587 + b * 0.114 <= brightnessThreshold)
		{
			i += 0.001;
			const [h, s, l] = rgbToHsl(r, g, b);
			[r, g, b] = hslToRgb(h, s, l + i);
		}
		boonGUI_ColorsSeenBefore.set(key, [r, g, b].join(" "));
	}
	return boonGUI_ColorsSeenBefore.get(key);
}

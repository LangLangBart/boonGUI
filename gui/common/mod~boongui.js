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

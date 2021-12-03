if (!global.g_autociv_optionsFiles)
	var g_autociv_optionsFiles = ["gui/options/options.json"];
g_autociv_optionsFiles.push("boongui_data/options.json");

init = function(data, hotloadData)
{
	g_ChangedKeys = hotloadData ? hotloadData.changedKeys : new Set();
	g_TabCategorySelected = hotloadData ? hotloadData.tabCategorySelected : 0;

	// CHANGES START /////////////////////////
	g_Options = [];
	for (const options of g_autociv_optionsFiles)
		Array.prototype.push.apply(g_Options, Engine.ReadJSONFile(options));
	// CHANGES END /////////////////////////

	translateObjectKeys(g_Options, ["label", "tooltip"]);

	// DISABLE IF DATA IS LOADED DYNAMICALLY
	// deepfreeze(g_Options);

	placeTabButtons(
		g_Options,
		false,
		g_TabButtonHeight,
		g_TabButtonDist,
		selectPanel,
		displayOptions);
};

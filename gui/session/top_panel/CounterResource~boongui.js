CounterResource.prototype.rebuild = function(playerState, diploColor)
{
	this.count.caption = normalizeResourceCount(playerState.resourceCounts[this.resCode]);

	const gatherers = playerState.resourceGatherers[this.resCode];
	this.stats.caption = gatherers ? setStringTags(gatherers, { "color": diploColor }) : coloredText("0", "dimmedWhite");

	this.panel.tooltip = resourceNameFirstWord(this.resCode);
	this.panel.tooltip += setStringTags("\nGatherers", { "color": gatherers ? "white" : "dimmedWhite" }) + `${g_Indent}${g_Indent}` + this.stats.caption;

};

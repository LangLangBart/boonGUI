CounterResource.prototype.rebuild = function(playerState, diploColor)
{
	this.count.caption = normalizeResourceCount(playerState.resourceCounts[this.resCode]);

	const gatherers = playerState.resourceGatherers[this.resCode];
	this.stats.caption = gatherers ? setStringTags(gatherers, { "color": diploColor }) : coloredText("0", CounterPopulation.prototype.DimmedWhite);

	this.panel.tooltip = resourceNameFirstWord(this.resCode);
	this.panel.tooltip += setStringTags("\nGatherers", { "color": gatherers ? "white" : CounterPopulation.prototype.DimmedWhite }) + `${g_Indent}${g_Indent}` + this.stats.caption;

};

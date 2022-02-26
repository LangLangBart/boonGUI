CounterResource.prototype.rebuild = function(playerState, diploColor)
{
	this.count.caption = abbreviateLargeNumbers(Math.floor(playerState.resourceCounts[this.resCode]));

	const gatherers = playerState.resourceGatherers[this.resCode];
	this.stats.caption = gatherers ? setStringTags(gatherers, { "color": diploColor }) : 0;

	this.panel.tooltip = resourceNameFirstWord(this.resCode);
	this.panel.tooltip += setStringTags("\nGatherers", { "color": gatherers ? "white" : "200 200 200" }) + `${g_Indent}${g_Indent}` + this.stats.caption;

};

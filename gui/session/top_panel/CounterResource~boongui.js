CounterResource.prototype.rebuild = function(playerState, diploColor)
{
	this.count.caption = abbreviateLargeNumbers(Math.floor(playerState.resourceCounts[this.resCode]));

	const gatherers = playerState.resourceGatherers[this.resCode];
	this.stats.caption = gatherers ? setStringTags(gatherers, { "color": diploColor }) : 0;

	this.panel.tooltip = setStringTags(resourceNameFirstWord(this.resCode), CounterManager.ResourceTitleTags);
	this.panel.tooltip += setStringTags("\nGatherers", { "color": gatherers ? diploColor : "200 200 200" });
};

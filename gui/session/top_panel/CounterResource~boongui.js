CounterResource.prototype.rebuild = function(playerState, getAllyStatTooltip)
{
	this.count.caption = abbreviateLargeNumbers(Math.floor(playerState.resourceCounts[this.resCode]));

	const gatherers = playerState.resourceGatherers[this.resCode];
	this.stats.caption = gatherers ? setStringTags(gatherers, { "color": brightenedColor(playerState.color) }) : 0;

	// TODO: Set the tooltip only if hovered?
	let description = g_ResourceData.GetResource(this.resCode).description;
	if (description)
		description = "\n" + translate(description);

	this.panel.tooltip =
		setStringTags(resourceNameFirstWord(this.resCode), CounterManager.ResourceTitleTags) +
		description +
		getAllyStatTooltip(this.getTooltipData.bind(this)) + "\n" + CounterPopulation.prototype.CurrentGatherersTooltip;
};

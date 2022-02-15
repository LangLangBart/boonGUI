CounterPopulation.prototype.rebuild = function(playerState, getAllyStatTooltip)
{
	this.count.caption = sprintf(translate(this.CounterCaption), playerState);
	let total = 0;
	for (const resCode of g_ResourceData.GetCodes())
		total += playerState.resourceGatherers[resCode];

	this.stats.caption = total ? setStringTags(total,
		{ "color": brightenedColor(playerState.color) }) : 0;

	this.isTrainingBlocked = playerState.trainingBlocked;

	this.panel.tooltip =
		setStringTags(translate(this.PopulationTooltip), CounterManager.ResourceTitleTags) +
		getAllyStatTooltip(this.getTooltipData.bind(this)) + "\n" + this.CurrentGatherersTooltip;
};

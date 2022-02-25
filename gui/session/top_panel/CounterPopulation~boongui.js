CounterPopulation.prototype.rebuild = function(playerState, diploColor)
{
	this.count.caption = sprintf(translate(this.CounterCaption), playerState);
	let total = 0;
	for (const resCode of g_ResourceData.GetCodes())
		total += playerState.resourceGatherers[resCode];

	this.stats.caption = total ? setStringTags(total,
		{ "color": diploColor }) : 0;

	this.isTrainingBlocked = playerState.trainingBlocked;

	this.panel.tooltip = setStringTags(translate(this.PopulationTooltip), CounterManager.ResourceTitleTags);
	this.panel.tooltip += setStringTags("\nTotal Gatherers", { "color": total ? diploColor : "200 200 200" });
};

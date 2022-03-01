CounterPopulation.prototype.rebuild = function(playerState, diploColor)
{
	this.count.caption = sprintf(this.CounterCaption, playerState);
	const font = this.count.caption.length > 12 ? "sans-stroke-16" : "sans-stroke-18";
	this.count.caption = setStringTags(this.count.caption, { font });
	let total = 0;
	for (const resCode of g_ResourceData.GetCodes())
		total += playerState.resourceGatherers[resCode];

	this.stats.caption = total ? setStringTags(total, { "color": diploColor }) : 0;

	this.isTrainingBlocked = playerState.trainingBlocked;

	this.panel.tooltip = translate(this.PopulationTooltip);
	this.panel.tooltip += setStringTags("\nTotal Gatherers", { "color": total ? "white" : "200 200 200" }) + `${g_Indent}` + this.stats.caption;
};

CounterPopulation.prototype.CounterCaption = "%(popCount)s/%(popLimit)s\n" + setStringTags("(%(popMax)s)", { "font": "sans-stroke-14" });

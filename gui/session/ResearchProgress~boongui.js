ResearchProgressButton.prototype.onResearchedProgress = function(offset, techName, researchStatus)
{
	this.researcher = researchStatus.researcher;

	const template = GetTechnologyData(techName, g_Players[g_ViewedPlayer].civ);
	this.sprite.sprite = "stretched:" + this.PortraitDirectory + template.icon;

	let size = this.button.size;

	const top = this.buttonTop % 104;
	const right = (this.buttonTop - top) / 2;

	size.top = offset + top;
	size.right = 48 - right;
	size.left = 0 - right;

	// size.top = offset + this.buttonTop;
	// size.bottom = size.top + this.buttonHeight;

	size.bottom = size.top + this.buttonHeight;
	this.button.size = size;
	this.button.tooltip = getEntityNames(template);
	this.button.hidden = false;

	size = this.progress.size;
	size.top = this.progressTop + this.progressHeight * researchStatus.progress;
	this.progress.size = size;

	this.timeRemaining.caption =
		Engine.FormatMillisecondsIntoDateStringGMT(
			researchStatus.timeRemaining,
			translateWithContext("countdown format", this.CountdownFormat));
};

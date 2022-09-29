/**
 * This class is concerned with managing the different elements of the minimap panel.
 */
class MiniMapPanel
{
	constructor(playerViewControl, diplomacyColors, idleWorkerClasses)
	{
		this.diplomacyColorsButton = new MiniMapDiplomacyColorsButton(diplomacyColors);
		this.scoreButton = new MiniMapScoreButton();
		this.flareButton = new MiniMapFlareButton(playerViewControl);
		this.miniMap = new MiniMap();
		this.minimapPanel = Engine.GetGUIObjectByName("minimapPanel");
		this.hoverPanel = Engine.GetGUIObjectByName("hoverPanel");
		// StatsOverlay has no size defined, it serves to get the screen size, maybe there is a better way.
		this.stats = Engine.GetGUIObjectByName("Stats");
		this.miniMapSize();
		this.minimapPanel.onWindowResized = this.miniMapSize.bind(this);
	}

	flare(target, playerID)
	{
		return this.miniMap.flare(target, playerID);
	}

	isMouseOverMiniMap()
	{
		return this.miniMap.isMouseOverMiniMap();
	}

	miniMapSize()
	{
		const dimensionsMiniPanel = "0 100%-276 250 100%-26";
		const dimensionsHoverPanel = "0 100%-63 251 100%";
		const screenSizeWidth = this.stats.getComputedSize().right;
		// arbitrarily set to 1600, just felt right
		if (screenSizeWidth >= 1600)
		{
			this.minimapPanel.size = "0 100%-332 300 100%-32";
			this.hoverPanel.size = "0 100%-76 301 100%";
		}
		else
		{
			this.minimapPanel.size = dimensionsMiniPanel;
			this.hoverPanel.size = dimensionsHoverPanel;
		}

		// Check for good dimensions, width&height should be the same or close together.
		// const testSizes = ["idleWorkerButton", "minimapPanel"];
		// for (let i = 0; i < testSizes.length; i++)
		// {
		// 	const objects = Engine.GetGUIObjectByName(testSizes[i]).getComputedSize();
		// 	const width = objects.right - objects.left;
		// 	const height = objects.bottom - objects.top;
		// 	warn(uneval(`${testSizes[i]}` + "width" + width));
		// 	warn(uneval(`${testSizes[i]}` + "height" + height));
		// }
	}
}

/**
 * Horizontal size of a tab button.
 */
var g_TabButtonWidth = 180;

/**
 * Adjusting your layout settings is simple, g_PlayerNameWidth moves the TitleHeadings (e.g. "Resoucres", g_multiplierWidths allows you to adjust the width of all columns and g_yStartHeightHead is useful for adjusting the heaadline for multiple columns in "Units, Structures and Resources". g_verticalOffsetAdjustCounters is used for adjusting the position of Counters and
 */
var g_PlayerNameWidth = 232;
var g_multiplierWidths = 1.83;
var g_yStartHeightHead = -20;
var g_verticalOffsetAdjustHeadings = 12;
var g_verticalOffsetAdjustCounters = 11;

/**
 * Horizontal space between two tab buttons.
 */
var g_TabButtonDist = 6;

var getScorePanelsData = () => [
	{
		"label": translate("Score"),
		"headings": [
			{ "identifier": "playername", "caption": translate("Player name"), "yStart": 16 + g_verticalOffsetAdjustHeadings, "width": g_PlayerNameWidth },
			{ "identifier": "totalScore", "caption": translate("Total score"), "yStart": 16 + g_verticalOffsetAdjustHeadings, "width": 100 * g_multiplierWidths },
			{ "identifier": "economyScore", "caption": translate("Economy score"), "yStart": 16 + g_verticalOffsetAdjustHeadings, "width": 100 * g_multiplierWidths },
			{ "identifier": "militaryScore", "caption": translate("Military score"), "yStart": 16 + g_verticalOffsetAdjustHeadings, "width": 100 * g_multiplierWidths },
			{ "identifier": "explorationScore", "caption": translate("Exploration score"), "yStart": 16 + g_verticalOffsetAdjustHeadings, "width": 100 * g_multiplierWidths }
		],
		"titleHeadings": [],
		"counters": [
			{ "width": 100 * g_multiplierWidths, "fn": calculateScoreTotal, "verticalOffset": 12 + g_verticalOffsetAdjustCounters },
			{ "width": 100 * g_multiplierWidths, "fn": calculateEconomyScore, "verticalOffset": 12 + g_verticalOffsetAdjustCounters },
			{ "width": 100 * g_multiplierWidths, "fn": calculateMilitaryScore, "verticalOffset": 12 + g_verticalOffsetAdjustCounters },
			{ "width": 100 * g_multiplierWidths, "fn": calculateExplorationScore, "verticalOffset": 12 + g_verticalOffsetAdjustCounters }
		],
		"teamCounterFn": calculateScoreTeam
	},
	{
		"label": translate("Structures"),
		"headings": [
			{ "identifier": "playername", "caption": translate("Player name"), "yStart": 16 + g_verticalOffsetAdjustHeadings, "width": g_PlayerNameWidth },
			{ "identifier": "total", "caption": translate("Total"), "yStart": 34 + g_verticalOffsetAdjustHeadings, "width": 105 * g_multiplierWidths },
			{ "identifier": "House", "caption": translate("Houses"), "yStart": 34 + g_verticalOffsetAdjustHeadings, "width": 85 * g_multiplierWidths },
			{ "identifier": "Economic", "caption": translate("Economic"), "yStart": 34 + g_verticalOffsetAdjustHeadings, "width": 85 * g_multiplierWidths },
			{ "identifier": "Outpost", "caption": translate("Outposts"), "yStart": 34 + g_verticalOffsetAdjustHeadings, "width": 85 * g_multiplierWidths },
			{ "identifier": "Military", "caption": translate("Military"), "yStart": 34 + g_verticalOffsetAdjustHeadings, "width": 85 * g_multiplierWidths },
			{ "identifier": "Fortress", "caption": translate("Fortresses"), "yStart": 34 + g_verticalOffsetAdjustHeadings, "width": 85 * g_multiplierWidths },
			{ "identifier": "CivCentre", "caption": translate("Civ centers"), "yStart": 34 + g_verticalOffsetAdjustHeadings, "width": 85 * g_multiplierWidths },
			{ "identifier": "Wonder", "caption": translate("Wonders"), "yStart": 34 + g_verticalOffsetAdjustHeadings, "width": 85 * g_multiplierWidths }
		],
		"titleHeadings": [
			{
				"caption": sprintf(translate("Structure Statistics (%(constructed)s / %(destroyed)s / %(captured)s / %(lost)s)"),
					{
						"constructed": getColoredTypeTranslation("constructed"),
						"destroyed": getColoredTypeTranslation("destroyed"),
						"captured": getColoredTypeTranslation("captured"),
						"lost": getColoredTypeTranslation("lost")
					}),
				"yStart": 16 + g_yStartHeightHead,
				"width": (85 * 7 + 105) * g_multiplierWidths
			}	// width = 700
		],
		"counters": [
			{ "width": 105 * g_multiplierWidths, "fn": calculateBuildings, "verticalOffset": 3 + g_verticalOffsetAdjustCounters },
			{ "width": 85 * g_multiplierWidths, "fn": calculateBuildings, "verticalOffset": 3 + g_verticalOffsetAdjustCounters },
			{ "width": 85 * g_multiplierWidths, "fn": calculateBuildings, "verticalOffset": 3 + g_verticalOffsetAdjustCounters },
			{ "width": 85 * g_multiplierWidths, "fn": calculateBuildings, "verticalOffset": 3 + g_verticalOffsetAdjustCounters },
			{ "width": 85 * g_multiplierWidths, "fn": calculateBuildings, "verticalOffset": 3 + g_verticalOffsetAdjustCounters },
			{ "width": 85 * g_multiplierWidths, "fn": calculateBuildings, "verticalOffset": 3 + g_verticalOffsetAdjustCounters },
			{ "width": 85 * g_multiplierWidths, "fn": calculateBuildings, "verticalOffset": 3 + g_verticalOffsetAdjustCounters },
			{ "width": 85 * g_multiplierWidths, "fn": calculateBuildings, "verticalOffset": 3 + g_verticalOffsetAdjustCounters }
		],
		"teamCounterFn": calculateBuildingsTeam
	},
	{
		"label": translate("Units"),
		"headings": [
			{ "identifier": "playername", "caption": translate("Player name"), "yStart": 16 + g_verticalOffsetAdjustHeadings, "width": g_PlayerNameWidth },
			{ "identifier": "total", "caption": translate("Total"), "yStart": 34 + g_verticalOffsetAdjustHeadings, "width": 105 * g_multiplierWidths },
			{ "identifier": "Infantry", "caption": translate("Infantry"), "yStart": 34 + g_verticalOffsetAdjustHeadings, "width": 95 * g_multiplierWidths },
			{ "identifier": "Worker", "caption": translate("Worker"), "yStart": 34 + g_verticalOffsetAdjustHeadings, "width": 95 * g_multiplierWidths },
			{ "identifier": "Cavalry", "caption": translate("Cavalry"), "yStart": 34 + g_verticalOffsetAdjustHeadings, "width": 85 * g_multiplierWidths },
			{ "identifier": "Champion", "caption": translate("Champion"), "yStart": 34 + g_verticalOffsetAdjustHeadings, "width": 85 * g_multiplierWidths },
			{ "identifier": "Hero", "caption": translate("Heroes"), "yStart": 34 + g_verticalOffsetAdjustHeadings, "width": 85 * g_multiplierWidths },
			{ "identifier": "Siege", "caption": translate("Siege"), "yStart": 34 + g_verticalOffsetAdjustHeadings, "width": 85 * g_multiplierWidths },
			{ "identifier": "Ship", "caption": translate("Navy"), "yStart": 34 + g_verticalOffsetAdjustHeadings, "width": 85 * g_multiplierWidths },
			{ "identifier": "Trader", "caption": translate("Traders"), "yStart": 34 + g_verticalOffsetAdjustHeadings, "width": 85 * g_multiplierWidths }
		],
		"titleHeadings": [
			{
				"caption": sprintf(translate("Unit Statistics (%(trained)s / %(killed)s / %(lost)s)"),
					{
						"trained": getColoredTypeTranslation("trained"),
						"killed": getColoredTypeTranslation("killed"),
						"lost": getColoredTypeTranslation("lost")
					}),
				"yStart": 16 + g_yStartHeightHead,
				"width": (85 * 8 + 105) * g_multiplierWidths
			}	// width = 785
		],
		"counters": [
			{ "width": 105 * g_multiplierWidths, "fn": calculateUnits, "verticalOffset": 3 + g_verticalOffsetAdjustCounters },
			{ "width": 95 * g_multiplierWidths, "fn": calculateUnits, "verticalOffset": 3 + g_verticalOffsetAdjustCounters },
			{ "width": 95 * g_multiplierWidths, "fn": calculateUnits, "verticalOffset": 3 + g_verticalOffsetAdjustCounters },
			{ "width": 85 * g_multiplierWidths, "fn": calculateUnits, "verticalOffset": 3 + g_verticalOffsetAdjustCounters },
			{ "width": 85 * g_multiplierWidths, "fn": calculateUnits, "verticalOffset": 3 + g_verticalOffsetAdjustCounters },
			{ "width": 85 * g_multiplierWidths, "fn": calculateUnits, "verticalOffset": 3 + g_verticalOffsetAdjustCounters },
			{ "width": 85 * g_multiplierWidths, "fn": calculateUnits, "verticalOffset": 3 + g_verticalOffsetAdjustCounters },
			{ "width": 85 * g_multiplierWidths, "fn": calculateUnits, "verticalOffset": 3 + g_verticalOffsetAdjustCounters },
			{ "width": 85 * g_multiplierWidths, "fn": calculateUnits, "verticalOffset": 3 + g_verticalOffsetAdjustCounters }
		],
		"teamCounterFn": calculateUnitsTeam
	},
	{
		"label": translate("Resources"),
		"headings": [
			{ "identifier": "playername", "caption": translate("Player name"), "yStart": 16 + g_verticalOffsetAdjustHeadings, "width": g_PlayerNameWidth },
			{ "identifier": "total", "caption": translate("Total"), "yStart": 34 + g_verticalOffsetAdjustHeadings, "width": 125 * g_multiplierWidths },
			...g_ResourceData.GetResources().map(res => ({
				"identifier": res.code,
				"caption": resourceNameFirstWord(res.code),
				"yStart": 34 + g_verticalOffsetAdjustHeadings,
				"width": 120 * g_multiplierWidths
			})),
			{
				"identifier": "tributes",
				"caption": translate("Tributes"),
				"headerCaption": sprintf(translate("Tributes \n(%(sent)s / %(received)s)"),
					{
						"sent": getColoredTypeTranslation("sent"),
						"received": getColoredTypeTranslation("received")
					}),
				"yStart": 16 + g_verticalOffsetAdjustHeadings,
				"width": 115 * g_multiplierWidths
			},
			{ "identifier": "loot", "caption": translate("Loot"), "yStart": 16 + g_verticalOffsetAdjustHeadings, "width": 75 * g_multiplierWidths },
			{ "identifier": "livestock", "caption": translate("Livestock bred"), "yStart": 16 + g_verticalOffsetAdjustHeadings, "width": 65 * g_multiplierWidths }
		],
		"titleHeadings": [
			{
				"caption": sprintf(translate("Resource Statistics (%(gathered)s / %(used)s)"),
					{
						"gathered": getColoredTypeTranslation("gathered"),
						"used": getColoredTypeTranslation("used")
					}),
				"yStart": 16 + g_yStartHeightHead,
				"width": (100 * g_ResourceData.GetCodes().length + 225) * g_multiplierWidths
			}
		],
		"counters": [
			{ "width": 125 * g_multiplierWidths, "fn": calculateTotalResources, "verticalOffset": 12 + g_verticalOffsetAdjustCounters },
			...g_ResourceData.GetCodes().map(code => ({
				"fn": calculateResources,
				"verticalOffset": 12 + g_verticalOffsetAdjustCounters,
				"width": 120 * g_multiplierWidths
			})),
			{ "width": 115 * g_multiplierWidths, "fn": calculateTributeSent, "verticalOffset": 12 + g_verticalOffsetAdjustCounters },
			{ "width": 75 * g_multiplierWidths, "fn": calculateLootCollected, "verticalOffset": 12 + g_verticalOffsetAdjustCounters },
			{ "width": 65 * g_multiplierWidths, "fn": calculateLivestockTrained, "verticalOffset": 12 + g_verticalOffsetAdjustCounters }
		],
		"teamCounterFn": calculateResourcesTeam
	},
	{
		"label": translate("Market"),
		"headings": [
			{ "identifier": "playername", "caption": translate("Player name"), "yStart": 16 + g_verticalOffsetAdjustHeadings, "width": g_PlayerNameWidth },
			{ "identifier": "tradeIncome", "caption": translate("Trade income"), "yStart": 16 + g_verticalOffsetAdjustHeadings, "width": 100 * g_multiplierWidths },
			{ "identifier": "barterEfficiency", "caption": translate("Barter efficiency"), "yStart": 16 + g_verticalOffsetAdjustHeadings, "width": 100 * g_multiplierWidths, "format": "PERCENTAGE" },
			...g_ResourceData.GetResources().map(res => {
				return {
					"identifier": res.code,
					"caption":
						// Translation: use %(resourceWithinSentence)s if needed
						sprintf(translate("%(resourceFirstWord)s exchanged"), {
							"resourceFirstWord": resourceNameFirstWord(res.code),
							"resourceWithinSentence": resourceNameWithinSentence(res.code)
						}),
					"yStart": 16 + g_verticalOffsetAdjustHeadings,
					"width": 100 * g_multiplierWidths
				};
			}),
			{ "identifier": "treasuresCollected", "caption": translate("Treasures collected"), "yStart": 16 + g_verticalOffsetAdjustHeadings, "width": 100 * g_multiplierWidths }
		],
		"titleHeadings": [],
		"counters": [
			{ "width": 100 * g_multiplierWidths, "fn": calculateTradeIncome, "verticalOffset": 12 + g_verticalOffsetAdjustCounters },
			{ "width": 100 * g_multiplierWidths, "fn": calculateBarterEfficiency, "verticalOffset": 12 + g_verticalOffsetAdjustCounters },
			...g_ResourceData.GetCodes().map(code => ({
				"width": 100 * g_multiplierWidths,
				"fn": calculateResourceExchanged,
				"verticalOffset": 12 + g_verticalOffsetAdjustCounters
			})),
			{ "width": 100 * g_multiplierWidths, "fn": calculateTreasureCollected, "verticalOffset": 12 + g_verticalOffsetAdjustCounters }
		],
		"teamCounterFn": calculateMarketTeam
	},
	{
		"label": translate("Miscellaneous"),
		"headings": [
			{ "identifier": "playername", "caption": translate("Player name"), "yStart": 16 + g_verticalOffsetAdjustHeadings, "width": g_PlayerNameWidth },
			{ "identifier": "killDeath", "caption": translate("Kill / Death Ratio"), "yStart": 16 + g_verticalOffsetAdjustHeadings, "width": 100 * g_multiplierWidths, "format": "DECIMAL2" },
			{ "identifier": "population", "caption": translate("Population"), "yStart": 16 + g_verticalOffsetAdjustHeadings, "width": 100 * g_multiplierWidths, "hideInSummary": true },
			{ "identifier": "mapControlPeak", "caption": translate("Map control \n(peak)"), "yStart": 16 + g_verticalOffsetAdjustHeadings, "width": 100 * g_multiplierWidths, "format": "PERCENTAGE" },
			{ "identifier": "mapControl", "caption": translate("Map control \n(finish)"), "yStart": 16 + g_verticalOffsetAdjustHeadings, "width": 100 * g_multiplierWidths, "format": "PERCENTAGE" },
			{ "identifier": "mapExploration", "caption": translate("Map exploration"), "yStart": 16 + g_verticalOffsetAdjustHeadings, "width": 100 * g_multiplierWidths, "format": "PERCENTAGE" },
			{ "identifier": "vegetarianRatio", "caption": translate("Vegetarian ratio"), "yStart": 16 + g_verticalOffsetAdjustHeadings, "width": 100 * g_multiplierWidths, "format": "PERCENTAGE" },
			{ "identifier": "feminization", "caption": translate("Feminization"), "yStart": 16 + g_verticalOffsetAdjustHeadings, "width": 100 * g_multiplierWidths, "format": "PERCENTAGE" },
			{
				"identifier": "bribes",
				"caption": translate("Bribes"),
				"headerCaption": sprintf(translate("Bribes\n(%(succeeded)s / %(failed)s)"),
					{
						"succeeded": getColoredTypeTranslation("succeeded"),
						"failed": getColoredTypeTranslation("failed")
					}),
				"yStart": 16 + g_verticalOffsetAdjustHeadings,
				"width": 139 * g_multiplierWidths
			}
		],
		"titleHeadings": [],
		"counters": [
			{ "width": 100 * g_multiplierWidths, "fn": calculateKillDeathRatio, "verticalOffset": 12 + g_verticalOffsetAdjustCounters },
			{ "width": 100 * g_multiplierWidths, "fn": calculatePopulationCount, "verticalOffset": 12 + g_verticalOffsetAdjustCounters, "hideInSummary": true },
			{ "width": 100 * g_multiplierWidths, "fn": calculateMapPeakControl, "verticalOffset": 12 + g_verticalOffsetAdjustCounters },
			{ "width": 100 * g_multiplierWidths, "fn": calculateMapFinalControl, "verticalOffset": 12 + g_verticalOffsetAdjustCounters },
			{ "width": 100 * g_multiplierWidths, "fn": calculateMapExploration, "verticalOffset": 12 + g_verticalOffsetAdjustCounters },
			{ "width": 100 * g_multiplierWidths, "fn": calculateVegetarianRatio, "verticalOffset": 12 + g_verticalOffsetAdjustCounters },
			{ "width": 100 * g_multiplierWidths, "fn": calculateFeminization, "verticalOffset": 12 + g_verticalOffsetAdjustCounters },
			{ "width": 139 * g_multiplierWidths, "fn": calculateBribes, "verticalOffset": 12 + g_verticalOffsetAdjustCounters }
		],
		"teamCounterFn": calculateMiscellaneousTeam
	}
];

var g_ChartPanelsData = [
	{
		"label": translate("Charts")
	}
];

function getColoredTypeTranslation(type)
{
	return g_SummaryTypes[type].color ?
		coloredText(g_SummaryTypes[type].caption, g_SummaryTypes[type].color) :
		g_SummaryTypes[type].caption;
}

function resetGeneralPanel()
{
	for (let h = 0; h < g_MaxHeadingTitle; ++h)
	{
		Engine.GetGUIObjectByName(`titleHeading[${h}]`).hidden = true;
		Engine.GetGUIObjectByName(`Heading[${h}]`).hidden = true;
		for (let p = 0; p < g_MaxPlayers; ++p)
		{
			Engine.GetGUIObjectByName(`valueData[${p}][${h}]`).hidden = true;
			for (let t = 0; t < g_MaxTeams; ++t)
			{
				Engine.GetGUIObjectByName(`valueDataTeam[${t}][${p}][${h}]`).hidden = true;
				Engine.GetGUIObjectByName(`valueDataTeam[${t}][${h}]`).hidden = true;
			}
		}
	}
}

function updateGeneralPanelHeadings(allHeadings)
{
	const headings = allHeadings.filter(heading => !heading.hideInSummary);

	let left = 31;
	for (const h in headings)
	{
		let headerGUIName = "playerNameHeading";
		if (h > 0)
			headerGUIName = `Heading[${h - 1}]`;

		const headerGUI = Engine.GetGUIObjectByName(headerGUIName);
		headerGUI.caption = headings[h].headerCaption || headings[h].caption;
		headerGUI.size = `${left} ${headings[h].yStart - 15} ${left + headings[h].width + 19} 130%`;
		headerGUI.hidden = false;

		if (headings[h].width < g_LongHeadingWidth)
			left += headings[h].width;
	}
}

function updateGeneralPanelTitles(titleHeadings)
{
	let left = 250;
	for (const th in titleHeadings)
	{
		if (th >= g_MaxHeadingTitle)
			break;

		if (titleHeadings[th].xOffset)
			left += titleHeadings[th].xOffset;

		const headerGUI = Engine.GetGUIObjectByName(`titleHeading[${th}]`);
		headerGUI.caption = titleHeadings[th].caption;
		headerGUI.size = `${left} ${titleHeadings[th].yStart - 15} ${left + titleHeadings[th].width} 100%`;
		headerGUI.hidden = false;

		if (titleHeadings[th].width < g_LongHeadingWidth)
			left += titleHeadings[th].width;
	}
}

function updateGeneralPanelCounter(allCounters)
{
	const counters = allCounters.filter(counter => !counter.hideInSummary);
	let rowPlayerObjectWidth = 0;
	let left = 0;

	for (let p = 0; p < g_MaxPlayers; ++p)
	{
		left = 247;
		let counterObject;

		for (const w in counters)
		{
			counterObject = Engine.GetGUIObjectByName(`valueData[${p}][${w}]`);
			counterObject.size = `${left} ${counters[w].verticalOffset} ${left + counters[w].width} 100%`;
			counterObject.hidden = false;
			left += (counters[w].width + 3);
		}

		if (rowPlayerObjectWidth == 0)
			rowPlayerObjectWidth = left;

		let counterTotalObject;
		for (let t = 0; t < g_MaxTeams; ++t)
		{
			left = 240;
			for (const w in counters)
			{
				counterObject = Engine.GetGUIObjectByName(`valueDataTeam[${t}][${p}][${w}]`);
				counterObject.size = `${left + 40} ${counters[w].verticalOffset} ${left + counters[w].width + 11} 100%`;
				counterObject.hidden = false;

				if (g_Teams[t])
				{
					const yStart = 25 + g_Teams[t].length * (g_PlayerBoxYSize + g_PlayerBoxGap) + 3 + counters[w].verticalOffset;
					counterTotalObject = Engine.GetGUIObjectByName(`valueDataTeam[${t}][${w}]`);
					counterTotalObject.size = `${left + 45} ${yStart - 5} ${left + counters[w].width + 25} 100%`;
					counterTotalObject.hidden = false;
				}

				left += counters[w].width;
			}
		}
	}
	return rowPlayerObjectWidth;
}

function updateGeneralPanelTeams()
{
	const withoutTeam = !g_Teams[-1] ? 0 : g_Teams[-1].length;

	if (!g_Teams || withoutTeam > 0)
		Engine.GetGUIObjectByName("noTeamsBox").hidden = false;

	if (!g_Teams)
		return;

	let yStart = g_TeamsBoxYStart + withoutTeam * (g_PlayerBoxYSize + g_PlayerBoxGap) + (withoutTeam ? 30 : 0);
	for (const i in g_Teams)
	{
		if (i == -1)
			continue;

		const teamBox = Engine.GetGUIObjectByName(`teamBoxt[${i}]`);
		teamBox.hidden = false;
		const teamBoxSize = teamBox.size;
		teamBoxSize.top = yStart;
		teamBox.size = teamBoxSize;

		yStart += g_TeamTwoBox + g_Teams[i].length * (g_PlayerBoxYSize + g_PlayerBoxGap) + 32;

		Engine.GetGUIObjectByName(`teamNameHeadingt[${i}]`).caption = `Team ${+i + 1}`;

		const teamHeading = Engine.GetGUIObjectByName(`teamHeadingt[${i}]`);
		const yStartTotal = 30 + g_Teams[i].length * (g_PlayerBoxYSize + g_PlayerBoxGap) + 10;
		teamHeading.size = `50 ${yStartTotal} 100% ${yStartTotal + 20}`;
		teamHeading.caption = translate("");
	}

	// If there are no players without team, hide "player name" heading
	if (!withoutTeam)
		Engine.GetGUIObjectByName("playerNameHeading").caption = "";
}

function initPlayerBoxPositions()
{
	for (let h = 0; h < g_MaxPlayers; ++h)
	{
		const playerBox = Engine.GetGUIObjectByName(`playerBox[${h}]`);
		let boxSize = playerBox.size;
		boxSize.top += h * (g_PlayerBoxYSize + g_PlayerBoxGap);
		boxSize.bottom = boxSize.top + g_PlayerBoxYSize;
		playerBox.size = boxSize;

		for (let i = 0; i < g_MaxTeams; ++i)
		{
			const playerBoxt = Engine.GetGUIObjectByName(`playerBoxt[${i}][${h}]`);
			boxSize = playerBoxt.size;
			boxSize.top += h * (g_PlayerBoxYSize + g_PlayerBoxGap);
			boxSize.bottom = boxSize.top + g_PlayerBoxYSize;
			playerBoxt.size = boxSize;
		}
	}
}

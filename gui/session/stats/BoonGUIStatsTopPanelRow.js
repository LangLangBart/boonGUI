class BoonGUIStatsTopPanelRow
{

	static Regex_Emblem = /^.+\/(.+)\.png$/;

	constructor(row, index)
	{
		const PREFIX = row.name;
		this.root = Engine.GetGUIObjectByName(PREFIX);
		this.root.size = BoonGUIGetRowSize(index, 26);

		this.coloredTeamBackground = Engine.GetGUIObjectByName(`${PREFIX}_coloredTeamBackground`);
		this.coloredPlayerInfoBackground = Engine.GetGUIObjectByName(`${PREFIX}_coloredPlayerInfoBackground`);

		this.playerHighlight = Engine.GetGUIObjectByName(`${PREFIX}_playerHighlight`);
		this.playerHighlight.onPress = () => focusCC(true, this.state);
		this.team = Engine.GetGUIObjectByName(`${PREFIX}_team`);
		this.player = Engine.GetGUIObjectByName(`${PREFIX}_player`);
		this.rating = Engine.GetGUIObjectByName(`${PREFIX}_rating`);

		this.civHighlight = Engine.GetGUIObjectByName(`${PREFIX}_civHighlight`);
		this.civHighlight.onPress = () => openStructTree(g_CivData[this.state.civ].Code);
		this.civIcon = Engine.GetGUIObjectByName(`${PREFIX}_civIcon`);

		this.phaseHighlight = Engine.GetGUIObjectByName(`${PREFIX}_phaseHighlight`);
		this.phaseIcon = Engine.GetGUIObjectByName(`${PREFIX}_phaseIcon`);
		this.phaseHighlight.onPress = () => focusCC(true, this.state);
		this.phaseProgress = Engine.GetGUIObjectByName(`${PREFIX}_phaseProgressSlider`);
		this.phaseProgressTop = this.phaseProgress.size.top;
		this.phaseProgressHeight = this.phaseProgress.size.bottom - this.phaseProgress.size.top;

		this.coloredPlayerStatsBackground = Engine.GetGUIObjectByName(`${PREFIX}_coloredPlayerStatsBackground`);
		this.coloredPlayerStatsBorder = Engine.GetGUIObjectByName(`${PREFIX}_coloredPlayerStatsBorder`);

		this.popHighlight = Engine.GetGUIObjectByName(`${PREFIX}_popHighlight`);
		this.popCount = Engine.GetGUIObjectByName(`${PREFIX}_popCount`);
		this.popLimit = Engine.GetGUIObjectByName(`${PREFIX}_popLimit`);
		this.idleWorkerHighlight = Engine.GetGUIObjectByName(`${PREFIX}_idleWorkerHighlight`);
		this.idleWorkerHeader = Engine.GetGUIObjectByName("StatsTopPanelHeaderSleepSymbol");
		// TODO in observer mode the idle button is disabled, it shouldn't be.
		this.idleWorkerHighlight.onPress = () => findIdleUnit(g_boonGUI_WorkerTypes);
		this.idleWorkerCount = Engine.GetGUIObjectByName(`${PREFIX}_idleWorkerCount`);

		this.resource = {
			"counts": {},
			"gatherers": {},
			"rates": {}
		};

		for (const resType of g_BoonGUIResTypes)
		{
			this.resource[resType] = Engine.GetGUIObjectByName(`${PREFIX}_${resType}Highlight`);
			this.resource.counts[resType] = Engine.GetGUIObjectByName(`${PREFIX}_${resType}Counts`);
			this.resource.gatherers[resType] = Engine.GetGUIObjectByName(`${PREFIX}_${resType}Gatherers`);
			this.resource.rates[resType] = Engine.GetGUIObjectByName(`${PREFIX}_${resType}Rates`);
		}

		this.femaleCitizenHighlight = Engine.GetGUIObjectByName(`${PREFIX}_femaleCitizenHighlight`);
		this.femaleCitizen = Engine.GetGUIObjectByName(`${PREFIX}_femaleCitizen`);
		this.infantryHighlight = Engine.GetGUIObjectByName(`${PREFIX}_infantryHighlight`);
		this.infantry = Engine.GetGUIObjectByName(`${PREFIX}_infantry`);
		this.cavalryHighlight = Engine.GetGUIObjectByName(`${PREFIX}_cavalryHighlight`);
		this.cavalry = Engine.GetGUIObjectByName(`${PREFIX}_cavalry`);

		this.ecoTechHighlight = Engine.GetGUIObjectByName(`${PREFIX}_ecoTechHighlight`);
		this.ecoTechCount = Engine.GetGUIObjectByName(`${PREFIX}_ecoTechCount`);
		this.milTechHighlight = Engine.GetGUIObjectByName(`${PREFIX}_milTechHighlight`);
		this.milTechCount = Engine.GetGUIObjectByName(`${PREFIX}_milTechCount`);

		this.killDeathRatioHighlight = Engine.GetGUIObjectByName(`${PREFIX}_killDeathRatioHighlight`);
		this.enemyUnitsKilledTotal = Engine.GetGUIObjectByName(`${PREFIX}_enemyUnitsKilledTotal`);
		this.divideSign = Engine.GetGUIObjectByName(`${PREFIX}_divideSign`);
		this.unitsLostTotal = Engine.GetGUIObjectByName(`${PREFIX}_unitsLostTotal`);
		this.killDeathRatio = Engine.GetGUIObjectByName(`${PREFIX}_killDeathRatio`);

		this.los = Engine.GetGUIObjectByName(`${PREFIX}_los`);
		this.losHighlight = Engine.GetGUIObjectByName(`${PREFIX}_losHighlight`);

		Engine.SetGlobalHotkey("structree", "Press", openStructTree);
		Engine.SetGlobalHotkey("civinfo", "Press", openStructTree);
	}

	update(state, scales)
	{
		this.root.hidden = !state;
		this.state = state;
		if (!state) return;

		let value, color, caption, tooltip, font, colorSingleRow;

		const shouldBlink = (Date.now() % 1000 < 500);
		this.coloredTeamBackground.sprite = `backcolor: ${state.teamColor} 115`;
		this.coloredPlayerInfoBackground.sprite = `backcolor: ${state.playerColor} 115`;
		this.coloredTeamBackground.hidden = state.team == -1;

		this.coloredPlayerInfoBackground.size = state.team != -1 ? "18 0 235 100%" : "0 0 235 100%";
		this.team.caption = state.team != -1 ? `${state.team + 1}` : "";

		const playerNick = setStringTags(state.nick, { "color": state.brightenedPlayerColor });
		caption = limitPlayerName(this.player, state.nick, this.rating, state.rating);
		this.player.caption = caption;
		this.playerHighlight.tooltip = setStringTags(state.name, { "color": state.brightenedPlayerColor });
		this.playerHighlight.tooltip += state.team != -1 ? setStringTags(`\nTeam ${this.team.caption}`, { "color": state.brightenedTeamColor }) : "";
		caption = Engine.IsAtlasRunning() ? "" : `${translateAISettings(g_InitAttributes.settings.PlayerData[state.index])}`;
		font = "sans-stroke-14";
		if (caption)
			this.playerHighlight.tooltip += setStringTags(`\n${caption}`, { "color": "210 210 210", font });
		this.playerHighlight.tooltip += setStringTags(`\n\n${this.jumpCivicCenterTooltip}`, { font });
		this.team.tooltip = this.playerHighlight.tooltip;
		this.rating.tooltip = this.playerHighlight.tooltip;
		this.rating.caption = state.rating;

		const civ = g_CivData[state.civ];
		const Emblem = civ.Emblem.replace(BoonGUIStatsTopPanelRow.Regex_Emblem, "$1");

		this.civHighlight.sprite_over = "cropped:1,0.6506:" + "session/portraits/emblems/states/hover.png";
		this.civIcon.sprite = `cropped:1,0.6506:${civ.Emblem}`;
		tooltip = "";
		tooltip += `${playerNick}\n\n`;
		tooltip += `[icon="${Emblem}" displace="12 0"] \n`;
		tooltip += `${civ.Name.padEnd(8)}\n`;
		tooltip += setStringTags(this.civIconHotkeyTooltip, { font });
		this.civHighlight.tooltip = tooltip;

		let phase;
		let progress = null;

		const phase_town =
			state.startedResearch.phase_town_generic ||
			state.startedResearch.phase_town_athen;

		const phase_city =
			state.startedResearch.phase_city_generic ||
			state.startedResearch.phase_city_athen;

		if (phase_city)
		{
			phase = "phase_city";
			progress = phase_city.progress;
		}
		else if (state.phase == "city")
		{
			phase = "phase_city";
		}
		else if (phase_town)
		{
			progress = phase_town.progress;
			phase = "phase_town";
		}
		else if (state.phase == "town")
		{
			phase = "phase_town";
		}
		else
		{
			phase = "phase_village";
		}

		const techData = GetTechnologyData(phase, state.civ);
		tooltip = "";
		tooltip += `${playerNick}\n`;
		tooltip += progress ? g_Indent + Engine.FormatMillisecondsIntoDateStringGMT((phase_town || phase_city).timeRemaining, "m:ss") + g_Indent : "";
		tooltip += techData.name.generic;
		this.phaseHighlight.tooltip = tooltip;
		this.phaseHighlight.tooltip += setStringTags(`\n\n${this.jumpCivicCenterTooltip}`, { font });

		this.phaseIcon.sprite = `stretched:session/portraits/${techData.icon}`;
		if (progress == null)
		{
			this.phaseProgress.hidden = true;
		}
		else
		{
			this.phaseProgress.hidden = false;
			const size = this.phaseProgress.size;
			size.top = this.phaseProgressTop + this.phaseProgressHeight * progress;
			this.phaseProgress.size = size;
		}

		const configColoredPlayerStatsBackground = Math.floor(Engine.ConfigDB_GetValue("user", "boongui.toppanel.coloredPlayerStatsBackground"));

		this.coloredPlayerStatsBackground.sprite = `backcolor: ${state.playerColor} ${configColoredPlayerStatsBackground}`;
		this.coloredPlayerStatsBorder.sprite = `backcolor: ${state.playerColor} 85`;

		tooltip = "";
		tooltip += `${playerNick}\n`;
		tooltip += state.trainingBlocked ? `${coloredText("Training blocked", CounterPopulation.prototype.PopulationAlertColor)}\n` : "";
		if (state.trainingBlocked && shouldBlink)
		{
			value = state.popCount;
			this.popCount.caption = setStringTags(`${value}/`, {
				"color": CounterPopulation.prototype.PopulationAlertColor
			});
			value = state.popLimit;
			this.popLimit.caption = setStringTags(value, {
				"color": CounterPopulation.prototype.PopulationAlertColor
			});
		}
		else
		{
			value = state.popCount;
			color = scales.getColor("popCount", state.popCount);
			this.popCount.caption = `${setStringTags(normalizeValue(value), { "color": color })}/`;
			value = state.popLimit;
			color = scales.getColor("popLimit", state.popLimit);
			this.popLimit.caption = setStringTags(normalizeValue(value), { "color": color });
		}
		tooltip += `Pop${g_Indent}${g_Indent} ${this.popCount.caption} ${this.popLimit.caption}\n`;
		tooltip += `Max${g_Indent}${g_Indent}${normalizeValue(state.popMax)}`;

		this.popHighlight.tooltip = tooltip;

		tooltip = "";
		tooltip += `${playerNick}\n`;

		const filterIdleMode = [];
		value = 0;
		for (let i = 0; i < state.queue.length; ++i)
		{
			if (state.queue[i].mode === "idle")
			{
				filterIdleMode.push(state.queue[i]);
				value += state.queue[i].count;
			}
		}
		const redScale = `220 0 0 ${Math.floor((155 * Math.pow(value, 2)) / (Math.pow(value, 2) + 20)) + 100}`;
		color = value ? g_stats.lastPlayerLength > 1 ? scales.getColor("idleWorker", value, true) : redScale : "dimmedWhite";
		font = value ? value > 99 ? "sans-bold-stroke-14" : "sans-bold-stroke-16" : "sans-stroke-16";

		this.idleWorkerCount.caption = setStringTags(normalizeValue(value), { color, font });

		tooltip += `Idle Workers${g_Indent}${g_Indent} ${setStringTags(value, { color })}\n`;
		font = "sans-stroke-14";

		for (const i in g_boonGUI_WorkerTypes)
		{
			// experiment with Named capture groups
			// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Groups_and_Backreferences
			const className = g_boonGUI_WorkerTypes[i].match(/(?<classNameRegex>^\w+)/)?.groups?.classNameRegex;
			if (!className) continue;

			value = 0;
			if (state.classCounts[className])
				for (let j = 0; j < filterIdleMode.length; ++j)
				{
					if (filterIdleMode[j].classesList.includes(className))
						value += filterIdleMode[j].count;
				}
			tooltip += setStringTags(`- ${className} ${value}\n`, { font, "color": value > 0 ? "lightRed" : "dimmedWhite" });
		}
		if (g_ViewedPlayer > 0)
			tooltip += `\n${setStringTags(this.idleUnitsTooltip, { font })}`;

		this.idleWorkerHeader.sprite = `streteched:color:${(!value || g_stats.lastPlayerLength > 1) ? "dimmedWhite" : color}:textureAsMask:session/phosphor/sleep.png`;
		this.idleWorkerHighlight.tooltip = tooltip;

		for (const resType of g_BoonGUIResTypes)
		{
			tooltip = "";
			tooltip += `${playerNick}\n`;
			tooltip += `${resourceNameFirstWord(resType)} ${resourceIcon(resType)}\n`;

			if (state.resourcesTechs[resType].length > 0)
			{
				for (let i = 0; i < state.resourcesTechs[resType].length; i += 3)
				{
					tooltip += `${state.resourcesTechs[resType].slice(i, i + 3).map(tech => `[icon="icon_${tech}" displace="0 5"]`).join(" ")}\n`;
				}
			}

			value = state.resourceCounts[resType];
			color = scales.getColor(`${resType}Counts`, value);
			caption = normalizeResourceCount(value);
			this.resource.counts[resType].caption = setStringTags(caption, { color });
			tooltip += `${setStringTags("Amount", { "color": value > 0 ? "white" : "dimmedWhite" })}${g_Indent}${g_Indent} ${this.resource.counts[resType].caption}\n`;

			const configResourceGatherersRates = Engine.ConfigDB_GetValue("user", "boongui.toppanel.resourceGatherersRates");

			value = state.resourceGatherers[resType];
			color = scales.getColor(`${resType}Gatherers`, value, false, 180);
			caption = isNaN(value) || value <= 0 ? setStringTags("0", { "color": "dimmedWhite" }) : value;
			// For single lines, the gathering rates are displayed in the player color.
			colorSingleRow = setStringTags(caption, (g_stats.lastPlayerLength > 1) ? { color } : { "color": state.brightenedPlayerColor });
			this.resource.gatherers[resType].caption = configResourceGatherersRates === "Gatherers" ? colorSingleRow : "";
			tooltip += `${setStringTags("Gatherers", { "color": value > 0 ? "white" : "dimmedWhite" })}${g_Indent}${g_Indent}${colorSingleRow}\n`;

			value = state.resourceRates[resType];
			color = scales.getColor(`${resType}Rates`, value, false, 180);
			caption = isNaN(value) || value <= 0 ? setStringTags("+0", { "color": "dimmedWhite" }) : `+${normalizeValue(value)}`;
			colorSingleRow = setStringTags(caption, (g_stats.lastPlayerLength > 1) ? { color } : { "color": state.brightenedPlayerColor });
			this.resource.rates[resType].caption = configResourceGatherersRates === "Rates" ? colorSingleRow : "";
			tooltip += `${setStringTags("Income/10s", { "color": value > 0 ? "white" : "dimmedWhite" })}${g_Indent}${colorSingleRow}\n`;

			this.resource[resType].tooltip = tooltip;
		}

		value = state.classCounts.FemaleCitizen ?? 0;
		color = scales.getColor("femaleCitizen", value);
		this.femaleCitizen.caption = setStringTags(normalizeValue(value), { color });
		tooltip = "";
		tooltip += `${playerNick}\n`;
		tooltip += `Female Citizen${g_Indent}${this.femaleCitizen.caption}`;
		this.femaleCitizenHighlight.tooltip = tooltip;

		value = state.classCounts.Infantry ?? 0;
		color = scales.getColor("infantry", value);
		this.infantry.caption = setStringTags(normalizeValue(value), { color });
		tooltip = "";
		tooltip += `${playerNick}\n`;
		tooltip += `Infantry${g_Indent}${this.infantry.caption}`;
		this.infantryHighlight.tooltip = tooltip;

		value = state.classCounts.Cavalry ?? 0;
		color = scales.getColor("cavalry", value);
		this.cavalry.caption = setStringTags(normalizeValue(value), { color });
		tooltip = "";
		tooltip += `${playerNick}\n`;
		tooltip += `Cavalry${g_Indent}${this.cavalry.caption}`;
		this.cavalryHighlight.tooltip = tooltip;

		const techArrayCount = [state.economyTechsCount, state.militaryTechsCount];
		const ecoTechColor = scales.getColor("economyTechsCount", techArrayCount[0]);
		const milTechColor = scales.getColor("militaryTechsCount", techArrayCount[1]);
		this.ecoTechCount.caption = techArrayCount[0] > 0 ? setStringTags(techArrayCount[0], { "color": ecoTechColor }) : "";
		this.milTechCount.caption = techArrayCount[1] > 0 ? setStringTags(techArrayCount[1], { "color": milTechColor }) : "";

		tooltip = "";
		tooltip += `${playerNick}\n`;
		tooltip += techArrayCount[0] > 0 ? `Economy Upgrades${g_Indent}${this.ecoTechCount.caption}\n` : "No Economy Upgrades";
		for (const resType of g_BoonGUIResTypes)
		{
			if (state.resourcesTechs[resType].length > 0)
			{
				tooltip += `${resourceNameFirstWord(resType)} ${resourceIcon(resType)}\n`;
				for (let i = 0; i < state.resourcesTechs[resType].length; i += 4)
				{
					tooltip += `${state.resourcesTechs[resType].slice(i, i + 4).map(tech => `[icon="icon_${tech}" displace="0 5"]`).join(" ")}\n`;
				}
			}
		}
		this.ecoTechHighlight.tooltip = tooltip;

		tooltip = "";
		tooltip += `${playerNick}\n`;
		if (state.militaryTechs.length > 0)
		{
			tooltip += `Military Upgrades${g_Indent}${this.milTechCount.caption}\n`;
			for (let i = 0; i < state.militaryTechs.length; i += 4)
			{
				tooltip += `${state.militaryTechs.slice(i, i + 4).map(tech => `[icon="icon_${tech}" displace="0 5"]`).join("  ")} \n`;
			}
			tooltip += "\n";
		}
		else
			tooltip += "No Military Upgrades";

		this.milTechHighlight.tooltip = tooltip;

		tooltip = "";
		tooltip += `${playerNick}\n`;
		value = state.killDeathRatio;
		color = scales.getColor("killDeathRatio", value);
		caption = formatKD(value);
		font = caption.length >= 4 ? "sans-stroke-18" : "sans-stroke-20";
		this.killDeathRatio.caption = setStringTags(caption, { color, font });
		this.enemyUnitsKilledTotal.caption = "";
		this.unitsLostTotal.caption = "";
		this.divideSign.caption = "";
		if (caption)
		{
			value = state.enemyUnitsKilledTotal;
			color = scales.getColor("enemyUnitsKilledTotal", value);
			this.enemyUnitsKilledTotal.caption = setStringTags(normalizeValue(value), { color });
			value = state.unitsLostTotal;
			color = scales.getColor("unitsLostTotal", value, true);
			this.unitsLostTotal.caption = setStringTags(normalizeValue(value), { color });
			this.divideSign.caption = "|";

			tooltip += `Kills ${g_Indent}${g_Indent}${g_Indent}${this.enemyUnitsKilledTotal.caption}\n`;
			tooltip += `Deaths ${g_Indent}${g_Indent}${this.unitsLostTotal.caption}\n`;
			tooltip += `K/D Ratio${g_Indent}${this.killDeathRatio.caption}`;
		}
		else
			tooltip += "Cowards do not count in battle; they are there, but not in it. Euripides";

		this.killDeathRatioHighlight.tooltip = tooltip;
		// Ever present slightly gray coloured empty circle, defined in the xml part.
		// Place a full circle in the player's color over the gray circle, the gray circle is slightly visible, this is good for contrast with dark colors.

		this.los.sprite = (state.hasSharedLos || state.numberAllies == 1) ? `stretched:color:${state.playerColor}:textureAsMask:session/phosphor/circle-full.png` : `stretched:color:${state.playerColor}:textureAsMask:session/phosphor/circle-empty.png`;

		color = state.brightenedPlayerColor;
		tooltip = `${playerNick}\n`;
		font = "sans-stroke-20";
		tooltip += `${setStringTags("○", { color, font })} / ${setStringTags("●", { color, font })}\n`;
		tooltip += "Full circle when cartography has been researched or when you are without mutual allies.";
		this.losHighlight.tooltip = tooltip;

	}
}

BoonGUIStatsTopPanelRow.prototype.jumpCivicCenterTooltip = `${setStringTags("\\[Click]", g_HotkeyTags)} jump to Civic Center.`;

BoonGUIStatsTopPanelRow.prototype.civIconHotkeyTooltip = `\n${colorizeHotkey("%(hotkey)s", "civinfo")}${colorizeHotkey("%(hotkey)s", "structree")}\nView Civilization Overview / Structure Tree`;

BoonGUIStatsTopPanelRow.prototype.civInfo = {
	"civ": "",
	"page": "page_structree.xml"
};
BoonGUIStatsTopPanelRow.prototype.idleUnitsTooltip = markForTranslation(`${colorizeHotkey("%(hotkey)s", "selection.idleworker")}\nCycle through idle workers of the viewed player.`);
// hold the abbreviated player names, so they don't have to be computed on every update
BoonGUIStatsTopPanelRow.prototype.abbreviatedPlayerNames = {};

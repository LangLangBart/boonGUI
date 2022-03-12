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
		this.civHighlight.onPress = () => openStrucTree(g_CivData[this.state.civ].Code);
		this.civIcon = Engine.GetGUIObjectByName(`${PREFIX}_civIcon`);

		this.phaseHighlight = Engine.GetGUIObjectByName(`${PREFIX}_phaseHighlight`);
		this.phaseIcon = Engine.GetGUIObjectByName(`${PREFIX}_phaseIcon`);
		this.phaseHighlight.onPress = () => focusCC(true, this.state);
		this.phaseProgress = Engine.GetGUIObjectByName(`${PREFIX}_phaseProgressSlider`);
		this.phaseProgressTop = this.phaseProgress.size.top;
		this.phaseProgressHeight = this.phaseProgress.size.bottom - this.phaseProgress.size.top;

		this.coloredPlayerStatsBackground = Engine.GetGUIObjectByName(`${PREFIX}_coloredPlayerStatsBackground`);
		this.coloredPlayerStatsBorder = Engine.GetGUIObjectByName(`${PREFIX}_coloredPlayerStatsBorder`);

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

		this.popHighlight = Engine.GetGUIObjectByName(`${PREFIX}_popHighlight`);
		this.popCount = Engine.GetGUIObjectByName(`${PREFIX}_popCount`);
		this.popLimit = Engine.GetGUIObjectByName(`${PREFIX}_popLimit`);
		this.femaleCitizenHighlight = Engine.GetGUIObjectByName(`${PREFIX}_femaleCitizenHighlight`);
		this.femaleCitizen = Engine.GetGUIObjectByName(`${PREFIX}_femaleCitizen`);
		this.infantryHighlight = Engine.GetGUIObjectByName(`${PREFIX}_infantryHighlight`);
		this.infantry = Engine.GetGUIObjectByName(`${PREFIX}_infantry`);
		this.cavalryHighlight = Engine.GetGUIObjectByName(`${PREFIX}_cavalryHighlight`);
		this.cavalry = Engine.GetGUIObjectByName(`${PREFIX}_cavalry`);

		this.techHighlight = Engine.GetGUIObjectByName(`${PREFIX}_techHighlight`);
		this.ecoTechCount = Engine.GetGUIObjectByName(`${PREFIX}_ecoTechCount`);
		this.verticalLine = Engine.GetGUIObjectByName(`${PREFIX}_verticalLine`);
		this.milTechCount = Engine.GetGUIObjectByName(`${PREFIX}_milTechCount`);

		this.killDeathRatioHighlight = Engine.GetGUIObjectByName(`${PREFIX}_killDeathRatioHighlight`);
		this.killDeathRatio = Engine.GetGUIObjectByName(`${PREFIX}_killDeathRatio`);
		this.enemyUnitsKilledTotal = Engine.GetGUIObjectByName(`${PREFIX}_enemyUnitsKilledTotal`);
		this.slashSign = Engine.GetGUIObjectByName(`${PREFIX}_slashSign`);
		this.unitsLostTotal = Engine.GetGUIObjectByName(`${PREFIX}_unitsLostTotal`);

		this.los = Engine.GetGUIObjectByName(`${PREFIX}_los`);

		Engine.SetGlobalHotkey("structree", "Press", openStrucTree);
		Engine.SetGlobalHotkey("civinfo", "Press", openStrucTree);
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
		if (state.team != -1)
		{
			this.coloredTeamBackground.hidden = false;
			this.coloredPlayerInfoBackground.size = "18 0 235 100%";
			this.team.caption = `${state.team + 1}`;
		}
		const playerNick = setStringTags(state.nick, { "color": state.playerColor });
		caption = state.nick.length <= 9 ? state.nick : state.nick.substr(0, 8) + "…";
		this.player.caption = caption;
		this.playerHighlight.tooltip = setStringTags(state.name, { "color": state.playerColor });
		this.playerHighlight.tooltip += state.team != -1 ? setStringTags("\nTeam " + this.team.caption, { "color": state.teamColor }) : "";
		caption = `${translateAISettings(g_InitAttributes.settings.PlayerData[state.index])}`;
		if (caption)
		{
			this.playerHighlight.tooltip += setStringTags(`\n${caption}`, { "color": "210 210 210", "font": "sans-stroke-14" });
		}

		this.team.tooltip = this.playerHighlight.tooltip;
		this.rating.tooltip = this.playerHighlight.tooltip;
		this.rating.caption = state.rating;

		const civ = g_CivData[state.civ];
		const Emblem = civ.Emblem.replace(BoonGUIStatsTopPanelRow.Regex_Emblem, "$1");

		this.civHighlight.sprite_over = "cropped:1.03,0.6506:" + "session/portraits/emblems/states/hover.png";
		this.civIcon.sprite = "cropped:1.03,0.6506:" + civ.Emblem;
		tooltip = "";
		tooltip += playerNick + "\n\n";
		tooltip += `[icon="${Emblem}" displace="12 0"] \n`;
		tooltip += `${civ.Name.padEnd(8)}\n`;
		font = "sans-stroke-14";
		tooltip += setStringTags("\nView Civilization Overview / Structure Tree\n" + colorizeHotkey("%(hotkey)s", "civinfo") + colorizeHotkey("%(hotkey)s", "structree"), { font });
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
		tooltip += playerNick + "\n";
		tooltip += progress ? g_Indent + Engine.FormatMillisecondsIntoDateStringGMT((phase_town || phase_city).timeRemaining, "m:ss") + g_Indent : "";
		tooltip += techData.name.generic;
		this.phaseHighlight.tooltip = tooltip;

		this.phaseIcon.sprite = "stretched:session/portraits/" + techData.icon;
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

		const configColoredPlayerStatsBackground = Math.floor(Engine.ConfigDB_GetValue("user", "boongui.toppanel.coloredPlayerStatsBackground")) || "10";

		this.coloredPlayerStatsBackground.sprite = `backcolor: ${state.playerColor} ${configColoredPlayerStatsBackground}`;
		this.coloredPlayerStatsBorder.sprite = `backcolor: ${state.playerColor} 85`;

		for (const resType of g_BoonGUIResTypes)
		{
			tooltip = "";
			tooltip += playerNick + "\n";
			tooltip += resourceNameFirstWord(resType) + " " + resourceIcon(resType) + "\n";

			if (state.resourcesTechs[resType].length > 0)
			{
				for (let i = 0; i < state.resourcesTechs[resType].length; i += 3)
				{
					tooltip += state.resourcesTechs[resType].slice(i, i + 3).map(tech => `[icon="icon_${tech}" displace="0 5"]`).join(" ") + "\n";
				}
			}

			value = state.resourceCounts[resType];
			color = scales.getColor(`${resType}Counts`, value);
			caption = normalizeResourceCount(value);
			this.resource.counts[resType].caption = setStringTags(caption, { color });
			tooltip += setStringTags("Amount", { "color": value > 0 ? "white" : "dimmedWhite" }) + `${g_Indent}${g_Indent} ${this.resource.counts[resType].caption}\n`;

			const configResourceGatherersRates = Engine.ConfigDB_GetValue("user", "boongui.toppanel.resourceGatherersRates") || "Gatherers";

			value = state.resourceGatherers[resType];
			color = scales.getColor(`${resType}Gatherers`, value, 180);
			caption = isNaN(value) || value <= 0 ? setStringTags("0", { "color": "dimmedWhite" }) : value;
			// For single lines, the gathering rates are displayed in the player color.
			colorSingleRow = setStringTags(caption, (g_stats.lastPlayerLength > 1) ? { color } : { "color": state.playerColor });
			this.resource.gatherers[resType].caption = configResourceGatherersRates === "Gatherers" ? colorSingleRow : "";
			tooltip += setStringTags("∑ Gatherers", { "color": value > 0 ? "white" : "dimmedWhite" }) + `${g_Indent}${colorSingleRow}\n`;

			value = state.resourceRates[resType];
			color = scales.getColor(`${resType}Rates`, value, 180);
			caption = isNaN(value) || value <= 0 ? setStringTags("+0", { "color": "dimmedWhite" }) : `+${normalizeValue(value)}`;
			colorSingleRow = setStringTags(caption, (g_stats.lastPlayerLength > 1) ? { color } : { "color": state.playerColor });
			this.resource.rates[resType].caption = configResourceGatherersRates === "Rates" ? colorSingleRow : "";
			tooltip += setStringTags("Income/10s", { "color": value > 0 ? "white" : "dimmedWhite" }) + `${g_Indent}${colorSingleRow}\n`;

			this.resource[resType].tooltip = tooltip;
		}

		tooltip = "";
		tooltip += playerNick + "\n";
		tooltip += state.trainingBlocked ? coloredText("Training blocked\n", CounterPopulation.prototype.PopulationAlertColor) : "";
		if (state.trainingBlocked && shouldBlink)
		{
			value = state.popCount;
			this.popCount.caption = setStringTags(value + "/", {
				"color": CounterPopulation.prototype.PopulationAlertColor,
			});
			value = state.popLimit;
			this.popLimit.caption = setStringTags(value, {
				"color": CounterPopulation.prototype.PopulationAlertColor,
			});
		}
		else
		{
			value = state.popCount;
			color = scales.getColor("popCount", state.popCount);
			this.popCount.caption = setStringTags(value, { "color": color }) + "/";
			value = state.popLimit;
			color = scales.getColor("popLimit", state.popCount);
			this.popLimit.caption = setStringTags(value, { "color": color });
		}
		tooltip += "Pop" + g_Indent + g_Indent + " " +`${this.popCount.caption} ${this.popLimit.caption}\n`;
		tooltip += "Max" + g_Indent + g_Indent + state.popMax;

		this.popHighlight.tooltip = tooltip;

		value = state.classCounts.FemaleCitizen ?? 0;
		color = scales.getColor("femaleCitizen", value);
		this.femaleCitizen.caption = setStringTags(value, { color });
		tooltip = "";
		tooltip += playerNick + "\n";
		tooltip += "Female Citizen" + g_Indent + this.femaleCitizen.caption;
		this.femaleCitizenHighlight.tooltip = tooltip;

		value = state.classCounts.Infantry ?? 0;
		color = scales.getColor("infantry", value);
		this.infantry.caption = setStringTags(value, { color });
		tooltip = "";
		tooltip += playerNick + "\n";
		tooltip += "Infantry" + g_Indent + this.infantry.caption;
		this.infantryHighlight.tooltip = tooltip;

		value = state.classCounts.Cavalry ?? 0;
		color = scales.getColor("cavalry", value);
		this.cavalry.caption = setStringTags(value, { color });
		tooltip = "";
		tooltip += playerNick + "\n";
		tooltip += "Cavalry" + g_Indent + this.cavalry.caption;
		this.cavalryHighlight.tooltip = tooltip;

		const techArrayCount = [state.economyTechsCount, state.militaryTechsCount];
		const ecoTechColor = scales.getColor("economyTechsCount", techArrayCount[0]);
		const milTechColor = scales.getColor("militaryTechsCount", techArrayCount[1]);
		this.ecoTechCount.caption = techArrayCount[0] > 0 ? setStringTags(techArrayCount[0], { "color": ecoTechColor }) : "";
		this.milTechCount.caption = techArrayCount[1] > 0 ? setStringTags(techArrayCount[1], { "color": milTechColor }) : "";

		tooltip = "";
		tooltip += playerNick + "\n";
		if (techArrayCount.reduce((a, b) => {return a + b;}) > 0)
			this.verticalLine.hidden = false;
		else
			tooltip += "No Uprades";

		tooltip += techArrayCount[0] > 0 ? `Economy upgrades${g_Indent}${this.ecoTechCount.caption}\n` : "";
		for (const resType of g_BoonGUIResTypes)
		{
			if (state.resourcesTechs[resType].length > 0)
			{
				tooltip += resourceNameFirstWord(resType) + "\n";
				for (let i = 0; i < state.resourcesTechs[resType].length; i += 4)
				{
					tooltip += state.resourcesTechs[resType].slice(i, i + 4).map(tech => `[icon="icon_${tech}" displace="0 5"]`).join(" ") + "\n";
				}
			}
		}

		tooltip += techArrayCount[1] > 0 ? `\nMilitary upgrades${g_Indent}${this.ecoTechCount.caption}\n` : "";

		for (let i = 0; i < state.militaryTechs.length; i += 4)
		{
			tooltip += state.militaryTechs.slice(i, i + 4).map(tech => `[icon="icon_${tech}" displace="0 5"]`).join("  ") + " \n";
		}
		tooltip += "\n";
		this.techHighlight.tooltip = tooltip;

		tooltip = "";
		tooltip += playerNick + "\n";
		value = state.killDeathRatio;
		color = scales.getColor("killDeathRatio", value);
		caption = formatKD(value);
		font = caption.length >= 4 ? "sans-stroke-18" : "sans-stroke-20";
		this.killDeathRatio.caption = setStringTags(caption, { color, font });
		this.enemyUnitsKilledTotal.caption = "";
		this.unitsLostTotal.caption = "";
		this.slashSign.caption = "";
		if (caption)
		{
			value = state.enemyUnitsKilledTotal;
			color = scales.getColor("enemyUnitsKilledTotal", value);
			this.enemyUnitsKilledTotal.caption = setStringTags(normalizeValue(value), { color });
			value = state.unitsLostTotal;
			color = scales.getColor("unitsLostTotal", value);
			this.unitsLostTotal.caption = setStringTags(normalizeValue(value), { color });
			this.slashSign.caption = "/";

			tooltip += "K/D Ratio" + g_Indent +`${this.killDeathRatio.caption}\n`;
			tooltip += "∑ Kills " + g_Indent + g_Indent + `${this.enemyUnitsKilledTotal.caption}\n`;
			tooltip += "∑ Deaths " + g_Indent + `${this.unitsLostTotal.caption}`;
		}

		this.killDeathRatioHighlight.tooltip = tooltip;

		const los = state.hasSharedLos || state.numberAllies == 1 ? "●" : "○";
		this.los.caption = setStringTags(los, { "color": state.playerColor });
		color = state.playerColor;
		tooltip = "";
		tooltip += playerNick + "\n";
		font = "sans-stroke-20";
		tooltip += `${setStringTags("○", { color, font })} / ${setStringTags("●", { color, font })}\n`;
		tooltip += "Full circle when cartography has been researched or when you are without mutual allies";
		this.los.tooltip = tooltip;
	}
}
BoonGUIStatsTopPanelRow.prototype.civInfo = {
	"civ": "",
	"page": "page_structree.xml"
};

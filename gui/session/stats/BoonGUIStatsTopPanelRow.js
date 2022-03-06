class BoonGUIStatsTopPanelRow
{

	static Regex_Emblem = /^.+\/(.+)\.png$/;

	constructor(row, index)
	{
		const PREFIX = row.name;
		this.root = Engine.GetGUIObjectByName(PREFIX);
		this.root.size = BoonGUIGetRowSize(index, 26);

		this.coloredTeamBackground = Engine.GetGUIObjectByName(`${PREFIX}_coloredTeamBackground`);
		this.coloredBackground = Engine.GetGUIObjectByName(`${PREFIX}_coloredBackground`);
		this.border = Engine.GetGUIObjectByName(`${PREFIX}_border`);

		this.playerHomeButton = Engine.GetGUIObjectByName(`${PREFIX}_playerHomeButton`);
		this.playerHomeButton.onPress = () => focusCC(true, this.state);

		this.team = Engine.GetGUIObjectByName(`${PREFIX}_team`);
		this.player = Engine.GetGUIObjectByName(`${PREFIX}_player`);
		this.rating = Engine.GetGUIObjectByName(`${PREFIX}_rating`);
		this.civ = Engine.GetGUIObjectByName(`${PREFIX}_civ`);
		this.civIcon = Engine.GetGUIObjectByName(`${PREFIX}_civIcon`);
		// Does not work. ↓
		// this.civ.onPress = () => CivIcon.prototype.openPage("page_structree.xml");
		this.pop = Engine.GetGUIObjectByName(`${PREFIX}_pop`);

		this.techCount = Engine.GetGUIObjectByName(`${PREFIX}_techCount`);
		this.femaleCitizen = Engine.GetGUIObjectByName(`${PREFIX}_femaleCitizen`);
		this.infantry = Engine.GetGUIObjectByName(`${PREFIX}_infantry`);
		this.cavalry = Engine.GetGUIObjectByName(`${PREFIX}_cavalry`);

		this.enemyUnitsKilledTotal = Engine.GetGUIObjectByName(`${PREFIX}_enemyUnitsKilledTotal`);
		this.unitsLostTotal = Engine.GetGUIObjectByName(`${PREFIX}_unitsLostTotal`);
		this.killDeathRatio = Engine.GetGUIObjectByName(`${PREFIX}_killDeathRatio`);

		this.resource = {
			"counts": {},
			"rates": {}
		};

		for (const resType of g_BoonGUIResTypes)
		{
			this.resource.counts[resType] = Engine.GetGUIObjectByName(`${PREFIX}_${resType}Counts`);
			this.resource.rates[resType] = Engine.GetGUIObjectByName(`${PREFIX}_${resType}Rates`);
		}

		this.los = Engine.GetGUIObjectByName(`${PREFIX}_los`);
		this.phase = Engine.GetGUIObjectByName(`${PREFIX}_phase`);
		this.phaseIcon = Engine.GetGUIObjectByName(`${PREFIX}_phaseIcon`);
		this.phase.onPress = () => focusCC(true, this.state);
		this.phaseProgress = Engine.GetGUIObjectByName(`${PREFIX}_phaseProgressSlider`);

		this.phaseProgressTop = this.phaseProgress.size.top;
		this.phaseProgressHeight = this.phaseProgress.size.bottom - this.phaseProgress.size.top;
	}

	update(state, scales)
	{
		this.root.hidden = !state;
		this.state = state;
		if (!state) return;

		let value, color, caption, tooltip, font, colorSingleRow;

		const shouldBlink = (Date.now() % 1000 < 500);
		this.coloredTeamBackground.sprite = `backcolor: ${state.teamColor} 115`;
		this.coloredBackground.sprite = `backcolor: ${state.playerColor} 115`;
		this.border.sprite = `backcolor: ${state.playerColor} 85`;

		if (state.team != -1)
		{
			this.coloredTeamBackground.hidden = false;
			this.coloredBackground.size = "18 0 235 100%";
			this.team.caption = `${state.team + 1}`;
		}
		const playerNick = setStringTags(state.nick, { "color": state.playerColor });
		caption = state.nick.length <= 9 ? state.nick : state.nick.substr(0, 8) + "…";
		this.player.caption = caption;
		this.playerHomeButton.tooltip = setStringTags(state.name, { "color": state.playerColor });
		this.playerHomeButton.tooltip += state.team != -1 ? setStringTags("\nTeam " + this.team.caption, { "color": state.teamColor }) : "";
		caption = `${translateAISettings(g_InitAttributes.settings.PlayerData[state.index])}`;
		if (caption)
		{
			this.playerHomeButton.tooltip += setStringTags(`\n${caption}`, { "color": "210 210 210", "font": "sans-stroke-14" });
		}

		this.team.tooltip = this.playerHomeButton.tooltip;
		this.rating.tooltip = this.playerHomeButton.tooltip;
		this.rating.caption = state.rating;

		const civ = g_CivData[state.civ];
		const Emblem = civ.Emblem.replace(BoonGUIStatsTopPanelRow.Regex_Emblem, "$1");

		this.civ.sprite_over = "cropped:1.03,0.6506:" + "session/portraits/emblems/states/hover.png";
		this.civIcon.sprite = "cropped:1.03,0.6506:" + civ.Emblem;
		tooltip = "";
		tooltip += playerNick + "\n\n";
		tooltip += `[icon="${Emblem}" displace="12 0"] \n`;
		tooltip += " " + `${civ.Name.padEnd(8)}\n`;
		font = "sans-stroke-14";
		tooltip += setStringTags(civ.History + "\n", { font });
		this.civ.tooltip = tooltip;

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
		this.phase.tooltip = tooltip;

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
		const popCount = state.popCount.toString().padStart(3);
		const popLimit = state.popLimit.toString().padStart(3);
		const popMax = state.popMax;
		tooltip = "";
		tooltip += playerNick + "\n";
		tooltip += "Population" + "\n";
		tooltip += state.trainingBlocked ? coloredText("Training blocked\n", CounterPopulation.prototype.PopulationAlertColor) : "";
		if (state.trainingBlocked && shouldBlink)
		{
			this.pop.caption = setStringTags(`${popCount}/${popLimit}`, {
				"color": CounterPopulation.prototype.PopulationAlertColor,
			});
		}
		else
		{
			const popCountColor = scales.getColor("popCount", state.popCount);
			const popLimitColor = scales.getColor("popLimit", state.popLimit);
			this.pop.caption =
				setStringTags(popCount, { "color": popCountColor }) + "/" +
				setStringTags(popLimit, { "color": popLimitColor });
		}
		tooltip += "Current" + `${popCount}\n`;
		tooltip += "Limit" + g_Indent + `${popLimit}\n`;
		tooltip += "Max" + g_Indent + "  " + `${popMax}`;

		this.pop.tooltip = tooltip;

		for (const resType of g_BoonGUIResTypes)
		{
			tooltip = "";
			tooltip += playerNick + "\n";
			tooltip += resourceNameFirstWord(resType) + "\n";

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

			value = state.resourceRates[resType];
			color = scales.getColor(`${resType}Rates`, value, 180);
			caption = isNaN(value) || value <= 0 ? setStringTags("+0", { "color": "dimmedWhite" }) : `+${normalizeValue(value)}`;
			// For single lines, the gathering rates are displayed in the player color.
			colorSingleRow = setStringTags(caption, (g_stats.lastPlayerLength > 1) ? { color } : { "color": state.playerColor });
			this.resource.rates[resType].caption = colorSingleRow;

			tooltip += setStringTags("Income/10s", { "color": value > 0 ? "white" : "dimmedWhite" }) + `${g_Indent}${colorSingleRow}\n`;

			value = state.resourceGatherers[resType];
			color = scales.getColor(`${resType}Gatherers`, value, 180);
			caption = isNaN(value) || value <= 0 ? setStringTags("0", { "color": "dimmedWhite" }) : value;
			colorSingleRow = setStringTags(caption, (g_stats.lastPlayerLength > 1) ? { color } : { "color": state.playerColor });

			tooltip += setStringTags("Gatherers", { "color": value > 0 ? "white" : "dimmedWhite" }) + `${g_Indent}${g_Indent}${colorSingleRow}\n`;

			this.resource.rates[resType].tooltip = tooltip;
		}

		const techArrayCount = [state.economyTechsCount, state.militaryTechsCount];
		const ecoTechColor = scales.getColor("economyTechsCount", techArrayCount[0]);
		const milTechColor = scales.getColor("militaryTechsCount", techArrayCount[1]);
		this.techCount.caption =
		setStringTags(techArrayCount[0], { "color": ecoTechColor }) + "/" + (techArrayCount[1] < 10 ? " " : "") +
		setStringTags(techArrayCount[1], { "color": milTechColor });

		tooltip = "";
		tooltip += techArrayCount[0] + techArrayCount[1] > 0 ? playerNick.padEnd(10) + "\n" : "";
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

		if (state.militaryTechs.length > 0)
		{
			tooltip += "\nMilitary Technologies\n";
			for (let i = 0; i < state.militaryTechs.length; i += 4)
			{
				tooltip += state.militaryTechs.slice(i, i + 4).map(tech => `[icon="icon_${tech}" displace="0 5"]`).join("  ") + " \n";
			}
			tooltip += "\n";
		}
		this.techCount.tooltip = tooltip;

		value = state.classCounts.FemaleCitizen ?? 0;
		color = scales.getColor("femaleCitizen", value);
		this.femaleCitizen.caption = setStringTags(value, { color });

		value = state.classCounts.Infantry ?? 0;
		color = scales.getColor("infantry", value);
		this.infantry.caption = setStringTags(value, { color });

		value = state.classCounts.Cavalry ?? 0;
		color = scales.getColor("cavalry", value);
		this.cavalry.caption = setStringTags(value, { color });

		value = state.enemyUnitsKilledTotal;
		color = scales.getColor("enemyUnitsKilledTotal", value);
		this.enemyUnitsKilledTotal.caption = setStringTags(normalizeValue(value), { color });

		value = state.unitsLostTotal;
		color = scales.getColor("unitsLostTotal", value);
		this.unitsLostTotal.caption = setStringTags(normalizeValue(value), { color });


		value = state.killDeathRatio;
		color = scales.getColor("killDeathRatio", value);
		caption = formatKD(value);
		this.killDeathRatio.caption = setStringTags(caption, { color });

		const los = state.hasSharedLos || state.numberAllies == 1 ? "●" : "○";
		this.los.caption = setStringTags(los, { "color": state.playerColor });
		color = state.playerColor;
		tooltip = "";
		font = "sans-stroke-20";
		tooltip += `${setStringTags("○", { color, font })} / ${setStringTags("●", { color, font })}\n`;
		tooltip += "Full circle when cartography has been researched or when you are without mutual allies";
		this.los.tooltip = tooltip;
	}
}

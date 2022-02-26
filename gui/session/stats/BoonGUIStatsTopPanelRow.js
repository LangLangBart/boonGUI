class BoonGUIStatsTopPanelRow
{

	static Regex_Emblem = /^.+\/(.+)\.png$/;

	constructor(row, index)
	{
		const PREFIX = row.name;
		this.root = Engine.GetGUIObjectByName(PREFIX);
		this.root.size = BoonGUIGetRowSize(index, 26);

		this.border = Engine.GetGUIObjectByName(`${PREFIX}_border`);

		this.team = Engine.GetGUIObjectByName(`${PREFIX}_team`);
		this.player = Engine.GetGUIObjectByName(`${PREFIX}_player`);
		this.rating = Engine.GetGUIObjectByName(`${PREFIX}_rating`);
		this.civ = Engine.GetGUIObjectByName(`${PREFIX}_civ`);
		this.pop = Engine.GetGUIObjectByName(`${PREFIX}_pop`);

		this.economyTechsCount = Engine.GetGUIObjectByName(`${PREFIX}_economyTechsCount`);
		this.militaryTechsCount = Engine.GetGUIObjectByName(`${PREFIX}_militaryTechsCount`);
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
		this.phaseIcon = Engine.GetGUIObjectByName(`${PREFIX}_phaseIcon`);
		this.phaseIcon.onPress = () => focusCC(true, this.state);
		this.phaseProgress = Engine.GetGUIObjectByName(`${PREFIX}_phaseProgressSlider`);

		this.phaseProgressTop = this.phaseProgress.size.top;
		this.phaseProgressHeight = this.phaseProgress.size.bottom - this.phaseProgress.size.top;
	}

	normalizeResourceCount(value)
	{
		if (value >= 10000)
		{
			return Math.floor(value / 1000) + setStringTags("k", { "font": "mono-10" });
		}
		return Math.floor(value / 10) * 10;

	}

	normalizeResourceRate(value)
	{
		if (value >= 10000)
		{
			return Math.floor(value / 1000) + setStringTags("k", { "font": "mono-10" });
		}
		else if (value >= 1000)
		{
			return (value / 1000).toFixed(1) + setStringTags("k", { "font": "mono-10" });
		}
		return value;

	}

	normalizeKillLost(value)
	{
		if (value >= 1000)
		{
			// avoid trailing zeros
			return Number((value / 1000).toFixed(1)) + setStringTags("k", { "font": "mono-10" });
		}
		return value;
	}

	update(state, scales)
	{
		this.root.hidden = !state;
		this.state = state;
		if (!state) return;

		let value, color, caption, tooltip, font, viewedPlayerColor;

		const shouldBlink = (Date.now() % 1000 < 500);
		this.border.sprite = `backcolor: ${state.playerColor} 70`;
		this.team.caption = setStringTags(state.team != -1 ? `${state.team + 1}` : "", { "color": state.teamColor });

		const playerNick = setStringTags(state.nick, { "color": state.playerColor });
		caption = state.nick.length <= 9 ? state.nick : state.nick.substr(0, 8) + "…";
		this.player.caption = setStringTags(caption, { "color": state.playerColor });
		this.player.tooltip = setStringTags(state.nick, { "color": state.playerColor });

		this.rating.caption = setStringTags(state.rating, { "color": state.playerColor });
		this.civ.caption = setStringTags(g_BoonGUICivs[state.civ], { "color": state.playerColor });

		const civ = g_CivData[state.civ];
		const Emblem = civ.Emblem.replace(BoonGUIStatsTopPanelRow.Regex_Emblem, "$1");

		tooltip = "";
		tooltip += playerNick + "\n\n";
		tooltip += `[icon="${Emblem}" displace="12 0"] \n`;
		tooltip += `History of the ${civ.Name.padEnd(8)}\n`;
		font = "sans-stroke-14";
		tooltip += " " + setStringTags(civ.History + "\n", { font });
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

		this.phaseIcon.sprite = "stretched:session/portraits/" + GetTechnologyData(phase, state.civ).icon;
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

		if (state.trainingBlocked && shouldBlink)
		{
			this.pop.caption = setStringTags(`${popCount}/${popLimit}`, {
				"color": CounterPopulation.prototype.PopulationAlertColor,
			});
		}
		else
		{
			const popLimitColor = scales.getColor("popLimit", state.popLimit);
			const popCountColor = scales.getColor("popCount", state.popCount);
			this.pop.caption =
				setStringTags(popCount, { "color": popCountColor }) + "/" +
				setStringTags(popLimit, { "color": popLimitColor });

		}

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
			caption = this.normalizeResourceCount(value);
			this.resource.counts[resType].caption = setStringTags(caption, { color });

			value = state.resourceRates[resType];
			color = scales.getColor(`${resType}Rates`, value, 180);
			caption = isNaN(value) || value <= 0 ? "" : `+${this.normalizeResourceRate(value)}`;
			viewedPlayerColor = setStringTags(caption, (g_ViewedPlayer < 0) ? { color } : { "color": state.playerColor });
			this.resource.rates[resType].caption = viewedPlayerColor;

			tooltip += setStringTags("Amount/10s", { "color": caption ? "white" : "200 200 200" }) + `${g_Indent}${viewedPlayerColor}\n`;

			value = state.resourceGatherers[resType];
			color = scales.getColor(`${resType}Gatherers`, value, 180);
			caption = isNaN(value) || value <= 0 ? "" : value;
			viewedPlayerColor = setStringTags(caption, (g_ViewedPlayer < 0) ? { color } : { "color": state.playerColor });

			tooltip += setStringTags("Gatherers", { "color": caption ? "white" : "200 200 200" }) + `${g_Indent}${g_Indent}${viewedPlayerColor}\n`;

			this.resource.counts[resType].tooltip = tooltip;
		}

		value = state.economyTechsCount;
		color = scales.getColor("economyTechsCount", value);
		this.economyTechsCount.caption = setStringTags(value, { color });
		tooltip = "";

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

		tooltip = tooltip ? playerNick.padEnd(50) + "\n" + tooltip + "\n" : "";
		this.economyTechsCount.tooltip = tooltip;


		value = state.militaryTechsCount;
		color = scales.getColor("militaryTechsCount", value);
		this.militaryTechsCount.caption = setStringTags(value, { color });
		tooltip = "";

		if (state.militaryTechs.length > 0)
		{
			tooltip += playerNick + "\n";
			tooltip += "Military techs\n";
			for (let i = 0; i < state.militaryTechs.length; i += 4)
			{
				tooltip += state.militaryTechs.slice(i, i + 4).map(tech => `[icon="icon_${tech}" displace="0 5"]`).join("  ") + " \n";
			}
			tooltip += "\n";
		}
		this.militaryTechsCount.tooltip = tooltip;

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
		this.enemyUnitsKilledTotal.caption = setStringTags(this.normalizeKillLost(value), { color });

		value = state.unitsLostTotal;
		color = scales.getColor("unitsLostTotal", value);
		this.unitsLostTotal.caption = setStringTags(this.normalizeKillLost(value), { color });


		value = state.killDeathRatio;
		color = scales.getColor("killDeathRatio", value);
		caption = formatKD(value);
		font = caption.length >= 4 ? "mono-stroke-12" : "mono-stroke-14";
		this.killDeathRatio.caption = setStringTags(caption, { color, font });

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

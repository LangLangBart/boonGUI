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

		this.popHighlight = Engine.GetGUIObjectByName(`${PREFIX}_popHighlight`);
		this.popCount = Engine.GetGUIObjectByName(`${PREFIX}_popCount`);
		this.popLimit = Engine.GetGUIObjectByName(`${PREFIX}_popLimit`);
		this.idleWorkerHighlight = Engine.GetGUIObjectByName(`${PREFIX}_idleWorkerHighlight`);
		// TODO, in observer mode the idle button is disabled, it shouldn't be.

		this.gameStartTime = new Date();


		this.idleWorkerCount = Engine.GetGUIObjectByName(`${PREFIX}_idleWorkerCount`);
		this.idleWorkerCount_prev = 0;
		this.idleWorkerAlphaMask = Engine.GetGUIObjectByName(`${PREFIX}_idleWorkerAlphaMask`);
		this.firstYawningTime = null;
		this.lastYawningTime = 0;



		this.itsMe;
		this.playername_multiplayer = Engine.ConfigDB_GetValue("user", "playername.multiplayer");
		this.playername_singleplayer = Engine.ConfigDB_GetValue("user", "playername.singleplayer");

		if( parseInt(Engine.ConfigDB_GetValue("user", "boongui.yawningIdlePopMax")) > 0)
		{
			this.yawningIdle = true;
			this.idleWorkerHighlight.onPress = () => {
				Engine.PlayUISound("audio/interface/alarm/beep_idle_01.ogg", false);
				this.yawningIdle = !this.yawningIdle;
			}
		}
		else
		{
			this.idleWorkerHighlight.onPress = () => findIdleUnit(g_boonGUI_WorkerTypes);
		}

		this.statPopCount = 0;

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
		this.coloredTeamBackground.hidden = state.team == -1;

		this.coloredPlayerInfoBackground.size = state.team != -1 ? "18 0 235 100%" : "0 0 235 100%";
		this.team.caption = state.team != -1 ? `${state.team + 1}` : "";

		const playerNick = setStringTags(state.nick, { "color": state.playerColor });
		caption = limitPlayerName(state.nick, 10, 13);
		this.player.caption = caption;
		this.playerHighlight.tooltip = setStringTags(state.name, { "color": state.playerColor });
		this.playerHighlight.tooltip += state.team != -1 ? setStringTags("\nTeam " + this.team.caption, { "color": state.teamColor }) : "";
		caption = Engine.IsAtlasRunning() ? "" : `${translateAISettings(g_InitAttributes.settings.PlayerData[state.index])}`;
		font = "sans-stroke-14";
		if (caption)
			this.playerHighlight.tooltip += setStringTags(`\n${caption}`, { "color": "210 210 210", font });

		this.team.tooltip = this.playerHighlight.tooltip;
		this.rating.tooltip = this.playerHighlight.tooltip;
		this.rating.caption = state.rating;

		const civ = g_CivData[state.civ];
		const Emblem = civ.Emblem.replace(BoonGUIStatsTopPanelRow.Regex_Emblem, "$1");

		this.civHighlight.sprite_over = "cropped:1,0.6506:" + "session/portraits/emblems/states/hover.png";
		this.civIcon.sprite = "cropped:1,0.6506:" + civ.Emblem;
		tooltip = "";
		tooltip += playerNick + "\n\n";
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

		const configColoredPlayerStatsBackground = Math.floor(Engine.ConfigDB_GetValue("user", "boongui.toppanel.coloredPlayerStatsBackground"));

		this.coloredPlayerStatsBackground.sprite = `backcolor: ${state.playerColor} ${configColoredPlayerStatsBackground}`;
		this.coloredPlayerStatsBorder.sprite = `backcolor: ${state.playerColor} 85`;

		tooltip = "";
		tooltip += playerNick + "\n";
		tooltip += state.trainingBlocked ? coloredText("Training blocked\n", CounterPopulation.prototype.PopulationAlertColor) : "";
		if (state.trainingBlocked && shouldBlink)
		{
			value = state.popCount;
			this.statPopCount = value;
			this.popCount.caption = setStringTags(value + "/", {
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

			this.statPopCount = value;

			color = scales.getColor("popCount", state.popCount);
			this.popCount.caption = setStringTags(normalizeValue(value), { "color": color }) + "/";
			value = state.popLimit;
			color = scales.getColor("popLimit", state.popLimit);
			this.popLimit.caption = setStringTags(normalizeValue(value), { "color": color });
		}
		tooltip += "Pop" + g_Indent + g_Indent + " " + `${this.popCount.caption} ${this.popLimit.caption}\n`;
		tooltip += "Max" + g_Indent + g_Indent + normalizeValue(state.popMax);

		this.popHighlight.tooltip = tooltip;

		tooltip = "";
		tooltip += playerNick + "\n";
		value = 0;
		for (let i = 0; i < state.queue.length; ++i)
		{
			if (state.queue[i].mode === "idle")
				value += state.queue[i].count;
		}
		this.idleWorkerHighlight.enabled = g_ViewedPlayer == state.index;

		// Aim for dark red background and light red font color
		this.idleWorkerAlphaMask.sprite = "color:200 0 0 " + (Math.min(value, 18) * 10);
		color = value > 0 ? "lightRed" : "dimmedWhite";
		font = value > 0 ? value > 99 ? "sans-bold-stroke-14" : "sans-bold-stroke-16" : "sans-stroke-16";
		this.idleWorkerCount.caption = setStringTags(normalizeValue(value), { color, font });
			
		tooltip += "Idle Workers" + g_Indent + g_Indent + " " + setStringTags(value, { color }) + "\n";
		font = "sans-stroke-14";
		for (const i in g_boonGUI_WorkerTypes)
		{
			const className = g_boonGUI_WorkerTypes[i].match("^[A-Za-z]+")[0];
			value = 0;
			for (let j = 0; j < state.queue.length; ++j)
			{
				// Mercenaries are already filtered out
				if (state.queue[j].mode === "idle" && state.queue[j].classesList.includes(className))
					value += state.queue[j].count;
			}
			tooltip += setStringTags(`- ${className} ${value}\n`, { font, "color": value > 0 ? "lightRed" : "dimmedWhite" });
		}

		tooltip += "\n" + setStringTags(this.idleUnitsTooltip, { font });
		this.idleWorkerHighlight.tooltip = tooltip;

		let playerNickShort = '';
		if(playerNick)
		try {
			playerNickShort = playerNick.match(/.*\](\w+)\[/)[1];		
		} catch (error) { }
	
		this.itsMe = (playerNickShort == this.playername_multiplayer || playerNickShort == this.playername_singleplayer);
		let t = new Date();
		const waitedTime = t - this.lastYawningTime;
		let idleCount = this.idleWorkerCount.caption.match(/.*\](\d+)\[/)[1];
		if (this.itsMe 
			&& this.yawningIdle 
			&& this.gameStartTime < t.setSeconds(t.getSeconds() - 5)
			&& this.statPopCount < parseInt(Engine.ConfigDB_GetValue("user", "boongui.yawningIdlePopMax")) 
			&& waitedTime * Math.min(idleCount, 5) > 1000 * parseInt(Engine.ConfigDB_GetValue("user", "boongui.yawningPauseMiliSeconds")))
			{



			if( this.idleWorkerCount_prev != idleCount ){ 

				this.firstYawningTime = t.setSeconds(t.getSeconds());
				this.stopYawningTime = t.setSeconds(t.getSeconds() + parseInt(Engine.ConfigDB_GetValue("user", "boongui.yawningDuration")) );
				this.idleWorkerCount_prev = idleCount;

				// error(this.gameStartArgs.time);
				// error(stanza.startTime);

				// this.gameStartArgs.time =
				// Math.round((Date.now() - stanza.startTime * 1000) / (1000 * 60));
				// txt += sprintf(this.GameStartFormat, this.gameStartArgs);



			}

			if(	t.setSeconds(t.getSeconds()) < this.stopYawningTime){
				let yawningAudioFile = Engine.ConfigDB_GetValue("user", "boongui.yawningAudioFile");
				if(idleCount == 1 && yawningAudioFile == "we-are-ready-with-it.ogg") 
					Engine.PlayUISound("audio/interface/alarm/i-ready-with-it.ogg");
				else
					Engine.PlayUISound("audio/interface/alarm/" + yawningAudioFile , false);
				this.lastYawningTime = Date.now();
			}else{
				let yawningAginMuchLater = Engine.ConfigDB_GetValue("user", "boongui.yawningAginMuchLater");
				if( t.setSeconds(t.getSeconds() + yawningAginMuchLater) < this.stopYawningTime){
					this.idleWorkerCount_prev = idleCount;
				}
			}
		}

		for (const resType of g_BoonGUIResTypes)
		{
			tooltip = "";
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

			const configResourceGatherersRates = Engine.ConfigDB_GetValue("user", "boongui.toppanel.resourceGatherersRates");

			value = state.resourceGatherers[resType];
			color = scales.getColor(`${resType}Gatherers`, value, false, 180);
			caption = isNaN(value) || value <= 0 ? setStringTags("0", { "color": "dimmedWhite" }) : value;
			// For single lines, the gathering rates are displayed in the player color.
			colorSingleRow = setStringTags(caption, (g_stats.lastPlayerLength > 1) ? { color } : { "color": state.playerColor });
			this.resource.gatherers[resType].caption = configResourceGatherersRates === "Gatherers" ? colorSingleRow : "";
			tooltip += setStringTags("Gatherers", { "color": value > 0 ? "white" : "dimmedWhite" }) + `${g_Indent}${g_Indent}${colorSingleRow}\n`;

			value = state.resourceRates[resType];
			color = scales.getColor(`${resType}Rates`, value, false, 180);
			caption = isNaN(value) || value <= 0 ? setStringTags("+0", { "color": "dimmedWhite" }) : `+${normalizeValue(value)}`;
			colorSingleRow = setStringTags(caption, (g_stats.lastPlayerLength > 1) ? { color } : { "color": state.playerColor });
			this.resource.rates[resType].caption = configResourceGatherersRates === "Rates" ? colorSingleRow : "";
			tooltip += setStringTags("Income/10s", { "color": value > 0 ? "white" : "dimmedWhite" }) + `${g_Indent}${colorSingleRow}\n`;

			this.resource[resType].tooltip = tooltip;
		}

		value = state.classCounts.FemaleCitizen ?? 0;
		color = scales.getColor("femaleCitizen", value);
		this.femaleCitizen.caption = setStringTags(normalizeValue(value), { color });
		tooltip = "";
		tooltip += playerNick + "\n";
		tooltip += "Female Citizen" + g_Indent + this.femaleCitizen.caption;
		this.femaleCitizenHighlight.tooltip = tooltip;

		value = state.classCounts.Infantry ?? 0;
		color = scales.getColor("infantry", value);
		this.infantry.caption = setStringTags(normalizeValue(value), { color });
		tooltip = "";
		tooltip += playerNick + "\n";
		tooltip += "Infantry" + g_Indent + this.infantry.caption;
		this.infantryHighlight.tooltip = tooltip;

		value = state.classCounts.Cavalry ?? 0;
		color = scales.getColor("cavalry", value);
		this.cavalry.caption = setStringTags(normalizeValue(value), { color });
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
		tooltip += techArrayCount[0] > 0 ? `Economy Upgrades${g_Indent}${this.ecoTechCount.caption}\n` : "No Economy Upgrades";
		for (const resType of g_BoonGUIResTypes)
		{
			if (state.resourcesTechs[resType].length > 0)
			{
				tooltip += resourceNameFirstWord(resType) + " " + resourceIcon(resType) + "\n";
				for (let i = 0; i < state.resourcesTechs[resType].length; i += 4)
				{
					tooltip += state.resourcesTechs[resType].slice(i, i + 4).map(tech => `[icon="icon_${tech}" displace="0 5"]`).join(" ") + "\n";
				}
			}
		}
		this.ecoTechHighlight.tooltip = tooltip;

		tooltip = "";
		tooltip += playerNick + "\n";
		if (state.militaryTechs.length > 0)
		{
			tooltip += `Military Upgrades${g_Indent}${this.milTechCount.caption}\n`;
			for (let i = 0; i < state.militaryTechs.length; i += 4)
			{
				tooltip += state.militaryTechs.slice(i, i + 4).map(tech => `[icon="icon_${tech}" displace="0 5"]`).join("  ") + " \n";
			}
			tooltip += "\n";
		}
		else
			tooltip += "No Military Upgrades";

		this.milTechHighlight.tooltip = tooltip;

		tooltip = "";
		tooltip += playerNick + "\n";
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

			tooltip += "Kills " + g_Indent + g_Indent + g_Indent + `${this.enemyUnitsKilledTotal.caption}\n`;
			tooltip += "Deaths " + g_Indent + g_Indent + `${this.unitsLostTotal.caption}\n`;
			tooltip += "K/D Ratio" + g_Indent + `${this.killDeathRatio.caption}`;
		}
		else
			tooltip += "Cowards do not count in battle; they are there, but not in it. Euripides";

		this.killDeathRatioHighlight.tooltip = tooltip;

		const los = state.hasSharedLos || state.numberAllies == 1 ? "●" : "○";
		this.los.caption = setStringTags(los, { "color": state.playerColor });
		color = state.playerColor;
		tooltip = "";
		tooltip += playerNick + "\n";
		font = "sans-stroke-20";
		tooltip += `${setStringTags("○", { color, font })} / ${setStringTags("●", { color, font })}\n`;
		tooltip += "Full circle when cartography has been researched or when you are without mutual allies.";
		this.los.tooltip = tooltip;
	}
}

BoonGUIStatsTopPanelRow.prototype.civIconHotkeyTooltip = "\nView Civilization Overview / Structure Tree\n" + colorizeHotkey("%(hotkey)s", "civinfo") + colorizeHotkey("%(hotkey)s", "structree");

BoonGUIStatsTopPanelRow.prototype.civInfo = {
	"civ": "",
	"page": "page_structree.xml"
};

if(parseInt(Engine.ConfigDB_GetValue("user", "boongui.yawningIdlePopMax")) > 0)
	BoonGUIStatsTopPanelRow.prototype.idleUnitsTooltip = markForTranslation("switch on or of yawning sound. Use Hotkey to Cycle through idle workers of the viewed player.\n" + colorizeHotkey("%(hotkey)s" + " ", "selection.idleworker"));
else
	BoonGUIStatsTopPanelRow.prototype.idleUnitsTooltip = markForTranslation("Cycle through idle workers of the viewed player.\n" + colorizeHotkey("%(hotkey)s" + " ", "selection.idleworker"));

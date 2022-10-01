class BoonGUIStats
{

	constructor(playerViewControl)
	{
		this.root = Engine.GetGUIObjectByName("Stats");

		this.shouldForceRender = true;
		this.statsTopPanel = new BoonGUIStatsTopPanel(() => this.shouldForceRender);
		this.statsModes = new BoonGUIStatsModes(() => this.shouldForceRender);
		this.resourcesBuffer = new Map();
		this.lastPlayerLength = null;
		this.shortGameInfoLabel = Engine.GetGUIObjectByName("shortGameInfoLabel");
		this.resourceCounts = Engine.GetGUIObjectByName("resourceCounts");

		this.playerViewControl = playerViewControl;
		this.configValues();
		this.updateLayout();
		this.updateShortGameInfoLabel();

		this.checkbox = Engine.GetGUIObjectByName("visibilityStatsModesPanel");
		this.checkbox.tooltip = "Toggle the stats panel on the right side." + coloredText("\nLow performance gain when hidden.", "red");
		this.checkbox.checked = Engine.ConfigDB_GetValue("user", this.configName[2]) == "true";

		playerViewControl.registerPlayerIDChangeHandler(this.updateLayout.bind(this));
		playerViewControl.registerViewedPlayerChangeHandler(this.onViewedPlayerChange.bind(this));
		this.resizeInit();
		registerPlayersFinishedHandler(this.presentStatsTopPanel.bind(this));
		registerConfigChangeHandler(this.updateShortGameInfoLabel.bind(this));

		this.root.onTick = this.onTick.bind(this);
	}

	lastTick = 0;

	configValues()
	{
		for (let i = 0; i < this.configName.length; i++)
		{
			if (Engine.ConfigDB_GetValue("user", this.configName[i]) === "")
				Engine.ConfigDB_CreateAndWriteValueToFile("user", this.configName[i], "true", "config/user.cfg");
		}
		this.root.hidden = Engine.ConfigDB_GetValue("user", g_IsObserver ? this.configName[0] : this.configName[1]) == "false";
		this.statsModes.root.hidden = Engine.ConfigDB_GetValue("user", this.configName[2]) == "false";
	}

	toggle()
	{
		this.root.hidden = !this.root.hidden;
		toggleConfigBool(g_IsObserver ? BoonGUIStats.prototype.configName[0] : BoonGUIStats.prototype.configName[1]);
		this.shouldForceRender = true;
	}

	toggleCheckbox()
	{
		this.statsModes.root.hidden = !this.statsModes.root.hidden;
		toggleConfigBool(this.configName[2]);
		this.shouldForceRender = true;
	}

	onTick()
	{
		const forceRender = this.shouldForceRender;
		this.shouldForceRender = false;
		if (this.root.hidden)
		{
			if (this.lastPlayerLength != 0) this.resize(0);
			return;
		}

		if (forceRender || g_LastTickTime - this.lastTick >= g_StatusBarUpdate)
		{
			this.update();
			this.lastTick = g_LastTickTime;
		}
	}

	onViewedPlayerChange()
	{
		this.configValues();
		this.updateLayout();
		this.resize(this.lastPlayerLength);
	}

	presentStatsTopPanel()
	{
		// if a player resigns always show it
		this.root.hidden = false;
		Engine.ConfigDB_CreateAndWriteValueToFile("user", this.configName[0], "true", "config/user.cfg");
		this.onViewedPlayerChange();
	}

	playerColor(state)
	{
		return g_DiplomacyColors.getPlayerColor(state.index);
	}

	teamColor(state)
	{
		const teamRepresentatives = {};
		for (let i = 1; i < g_Players.length; ++i)
		{
			const group = g_Players[i].state == "active" ? g_Players[i].team : "";
			if (group != -1 && !teamRepresentatives[group])
				teamRepresentatives[group] = i;
		}
		return g_DiplomacyColors.getPlayerColor([teamRepresentatives[state.team] || state.index]);
	}

	resizeInit()
	{
		for (const i in Engine.GetGUIObjectByName("unitGroupPanel").children)
		{
			const button = Engine.GetGUIObjectByName(`unitGroupButton[${i}]`);
			const icon = Engine.GetGUIObjectByName(`unitGroupIcon[${i}]`);

			const label = Engine.GetGUIObjectByName(`unitGroupLabel[${i}]`);
			button.size = "0 0 50 50";
			icon.size = "3 3 47 47";
			label.font = "sans-bold-stroke-20";
			label.text_valign = "top";
			label.text_align = "right";
		}

		for (const i in Engine.GetGUIObjectByName("panelEntityButtons").children)
		{
			const panelEntButton = Engine.GetGUIObjectByName(`panelEntityButton[${i}]`);
			panelEntButton.size = "0 0 60 60";
			setPanelObjectPosition(panelEntButton, i, Infinity);
		}
	}

	resize(length)
	{
		const PAD = 5;
		this.lastPlayerLength = length;
		this.shortGameInfoLabel.hidden = !g_IsObserver && !this.playerViewControl.changePerspective;
		const shortGameInfoLabelPAD = this.shortGameInfoLabel.hidden ? "" : this.shortGameInfoLabel.size.bottom;
		let y = (26 * (length + 1) + shortGameInfoLabelPAD);
		const shortGameInfoLabel_width = Engine.GetGUIObjectByName("shortGameInfoLabel").size.right;
		this.statsTopPanel.root.size = `0 ${shortGameInfoLabelPAD} ${shortGameInfoLabel_width} ${y}`;
		y = this.statsTopPanel.root.size.bottom + PAD;

		const panelEntityButtons = Engine.GetGUIObjectByName("panelEntityButtons");
		panelEntityButtons.size = `2 ${y} 50 ${y + 60}`;
		y = panelEntityButtons.size.bottom + PAD;

		const chatPanel = Engine.GetGUIObjectByName("chatPanel");
		chatPanel.size = `0 ${y} 100% ${y + 150}`;
		y = chatPanel.size.bottom + PAD;

		const unitGroupPanel = Engine.GetGUIObjectByName("unitGroupPanel");
		unitGroupPanel.size = `0 ${y} 100% ${y + 200}`;
	}

	calculateResourceRates(state)
	{
		state.resourceRates = {};

		const buffer = this.resourcesBuffer.get(state.index);
		const now = g_SimState.timeElapsed;
		const gatheredNow = state.resourcesGathered;

		if (!buffer)
		{
			this.resourcesBuffer.set(state.index, [[now, gatheredNow]]);
			return;
		}

		const [last] = buffer[buffer.length - 1];
		if (now - last > 0)
		{
			while (buffer.length >= this.IncomeRateBufferSize) buffer.shift();
			buffer.push([now, gatheredNow]);
		}

		const [then, gatheredThen] = buffer[0];
		const deltaS = (now - then) / 1000;
		for (const resType of g_BoonGUIResTypes)
		{
			const rate = Math.round(((gatheredNow[resType] - gatheredThen[resType]) / deltaS) * 10);
			state.resourceRates[resType] = Math.floor(rate / 5) * 5;
		}
	}

	getPlayersStates()
	{
		return Engine.GuiInterfaceCall("boongui_GetOverlay", {
			g_IsObserver, g_ViewedPlayer, g_LastTickTime
		}).players ?? [];
	}

	update()
	{
		Engine.ProfileStart("BoonGUIStats:update");

		Engine.ProfileStart("BoonGUIStats:update:GuiInterfaceCall");
		const playersStates = this.getPlayersStates();
		Engine.ProfileStop();

		Engine.ProfileStart("BoonGUIStats:update:Calculations");
		for (const state of playersStates)
		{
			state.teamColor = this.teamColor(state);
			state.playerColor = this.playerColor(state);

			this.calculateResourceRates(state);
		}

		if (this.lastPlayerLength != playersStates.length)
		{
			this.resize(playersStates.length);
		}
		Engine.ProfileStop();

		Engine.ProfileStart("BoonGUIStats:update:TopPanel");
		this.statsTopPanel.update(playersStates);
		Engine.ProfileStop();

		Engine.ProfileStart("BoonGUIStats:update:StatsModes");
		if (this.checkbox.checked)
			this.statsModes.update(playersStates, this.mode);

		Engine.ProfileStop();

		Engine.ProfileStop();
	}

	updateLayout()
	{
		const isPlayer = g_ViewedPlayer > 0;

		const trade = Engine.GetGUIObjectByName("tradeButton");
		const diplomacy = Engine.GetGUIObjectByName("diplomacyButton");
		const objectives = Engine.GetGUIObjectByName("objectivesButton");
		const gameSpeed = Engine.GetGUIObjectByName("gameSpeedButton");
		const optionFollowPlayer = Engine.GetGUIObjectByName("optionFollowPlayer");
		const viewPlayer = Engine.GetGUIObjectByName("viewPlayer");
		const menuButton = Engine.GetGUIObjectByName("menuButton");
		const topPanel = Engine.GetGUIObjectByName("topPanel");
		topPanel.sprite = "topPanelTransparent";

		viewPlayer.hidden = !g_IsObserver && !this.playerViewControl.changePerspective;
		diplomacy.hidden = !isPlayer;
		trade.hidden = !isPlayer;
		optionFollowPlayer.hidden = !(g_IsObserver && isPlayer);
		optionFollowPlayer.size = "0 4 20 100%";

		// Nice future project to show the menuButton upon hovering over it and hide it otherwise
		// placeHoldermenuButton.onMouseEnter = function()
		// {
		// 	placeHoldermenuButton.hidden = true;
		// 	menuButton.hidden = false;
		// };
		// menuButton.onMouseLeave = function()
		// {
		// 	placeHoldermenuButton.hidden = false;
		// 	menuButton.hidden = true;
		// };

		const buttonName = [[trade], [diplomacy], [objectives], [optionFollowPlayer], [viewPlayer], [gameSpeed], [menuButton]];
		for (let i = 0; i < buttonName.length; i++)
		{
			const widthButton = buttonName[i][0].size.right - buttonName[i][0].size.left;
			buttonName[i].push(Math.abs(widthButton));
		}

		let remainingWidth = buttonName.reduce((v, c) => v + (c[0].hidden ? 0 : c[1]), 0);

		topPanel.size = "100%-" + remainingWidth + " -3 100% 34";

		for (const els of buttonName)
		{
			const [el, size] = els;

			if (el.hidden) continue;

			const nextWidth = remainingWidth - size;
			el.size = `100%-${remainingWidth} 4 100%-${nextWidth} 32`;
			remainingWidth = nextWidth;
		}
		Engine.GetGUIObjectByName("followPlayerLabel").hidden = true;
		Engine.GetGUIObjectByName("resourceCounts").hidden = true;
		Engine.GetGUIObjectByName("civIcon").hidden = true;
		Engine.GetGUIObjectByName("buildLabel").hidden = true;

		// some tiny adjustments that are so trivial, it would be wasteful to add the entire file
		// top right corner for timer
		Engine.GetGUIObjectByName("dataCounter").font = "sans-stroke-20";
		Engine.GetGUIObjectByName("dataCounter").text_valign = "center";

		// The history backlog of text in the chat panel
		Engine.GetGUIObjectByName("chatHistoryText").font = "sans-stroke-16";

		// The dev overlay should stay above the stats mode overlay
		Engine.GetGUIObjectByName("devCommandsOverlay").z = 100;

		Engine.GetGUIObjectByName("menuButton").z = 200;
		Engine.GetGUIObjectByName("menuButtonPanel").z = 150;
		Engine.GetGUIObjectByName("chatDialogPanel").z = 200;
		// Game objectives panel
		Engine.GetGUIObjectByName("objectivesPanel").z = 150;
		Engine.GetGUIObjectByName("objectivesTitle").font = "sans-bold-16";
		Engine.GetGUIObjectByName("gameDescriptionText").font = "sans-stroke-16";
		for (let i = 0; i < 18; i++)
			Engine.GetGUIObjectByName("dev_command_label[" + i + "]").font = "sans-stroke-18";
	}

	updateShortGameInfoLabel()
	{
		this.mapCache = new MapCache();
		this.shortGameInfoLabel.caption = Engine.IsAtlasRunning() ? "" : sprintf("%(icon_alpha)s %(AlphaText)s  %(icon_map)s %(mapName)s%(mapSize)s%(biome)s  %(icon_pop)s %(pop)s%(duration)s%(rating)s", {
			"icon_alpha": '[icon="icon_alpha" displace="1 5"]',
			"AlphaText": "Alpha XXVI",
			"icon_map": '[icon="icon_map" displace="2 6"]',
			"mapName": this.mapCache.translateMapName(this.mapCache.getTranslatableMapName(g_InitAttributes.mapType, g_InitAttributes.map)),
			"mapSize": g_InitAttributes.mapType == "random" ? " - " + g_MapSizes.Name[g_MapSizes.Tiles.indexOf(g_InitAttributes.settings.Size)] : "",
			"biome": g_InitAttributes.settings.Biome ? " - " + g_Settings.Biomes.find(b => b.Id == g_InitAttributes.settings.Biome).Title : "",
			"icon_pop": '[icon="icon_pop" displace="3 5"]',
			"pop": g_InitAttributes.settings.PopulationCap !== undefined ? g_PopulationCapacities.Title[g_PopulationCapacities.Population.indexOf(g_InitAttributes.settings.PopulationCap)] : g_WorldPopulationCapacities.Title[g_WorldPopulationCapacities.Population.indexOf(g_InitAttributes.settings.WorldPopulationCap)] + " (WP)",
			"rating": g_InitAttributes.settings.RatingEnabled === true ? '  [icon="icon_rating" displace="-3 5"]' + coloredText("Rated", "red") : "",
			"duration": Engine.ConfigDB_GetValue("user", "boongui.showduration") == "true" ? this.durationReplay() : ""
		});
	}

	durationReplay()
	{
		// TODO better is to calculate the length from the number of turns in the commands.txt file
		const directory = Engine.GetCurrentReplayDirectory();
		return Engine.HasReplayMetadata(directory) ? '  [icon="icon_duration" displace="1 3"] ' + timeToString(Engine.GetReplayMetadata(directory).timeElapsed) : "";
	}
}

BoonGUIStats.prototype.IncomeRateBufferSize = 50;
BoonGUIStats.prototype.configName = ["boongui.observer.toppanel", "boongui.player.toppanel", "boongui.statsmode"];


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
		this.shortGameInfosLabels = Engine.GetGUIObjectByName("shortGameInfosLabels");
		this.resourceCounts = Engine.GetGUIObjectByName("resourceCounts");


		this.checkbox = Engine.GetGUIObjectByName("visibilityStatsModesPanel");
		this.checkbox.checked = Engine.ConfigDB_GetValue("user", "boongui.statsmode.checkbox") === "false";
		this.checkbox.tooltip = "Toggle the stats panel on the right side." + setStringTags("\nLow performance gain when hidden.", { "color": "red", "font": "sans-bold-stroke-13" });

		this.playerViewControl = playerViewControl;
		this.updateLayout();
		this.updateShortGameInfosLabels();
		playerViewControl.registerPlayerIDChangeHandler(this.updateLayout.bind(this));
		playerViewControl.registerViewedPlayerChangeHandler(this.updateLayout.bind(this));

		this.resizeInit();
		registerPlayersFinishedHandler(this.onPlayersFinished.bind(this));
		this.root.hidden = false;
		this.root.onTick = this.onTick.bind(this);
	}

	lastTick = 0;

	toggle()
	{
		this.root.hidden = !this.root.hidden;
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

	onPlayersFinished()
	{
		this.updateLayout();
		this.updateShortGameInfosLabels();
		this.resize(this.lastPlayerLength);
	}

	playerColor(state)
	{
		return rgbToGuiColor(g_DiplomacyColors.displayedPlayerColors[state.index]);
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
		if (g_IsObserver)
			return rgbToGuiColor(g_Players[teamRepresentatives[state.team] || state.index].color);
		return "white";
	}

	resizeInit()
	{
		for (const i in Engine.GetGUIObjectByName("unitGroupPanel").children)
		{
			const button = Engine.GetGUIObjectByName(`unitGroupButton[${i}]`);
			const icon = Engine.GetGUIObjectByName(`unitGroupIcon[${i}]`);

			const label = Engine.GetGUIObjectByName(`unitGroupLabel[${i}]`);
			button.size = '0 0 50 50';
			icon.size = '3 3 47 47';
			label.font = 'mono-stroke-20';
			label.text_valign = 'top';
			label.text_align = 'right';
		}

		for (const i in Engine.GetGUIObjectByName("panelEntityButtons").children)
		{
			const panelEntButton = Engine.GetGUIObjectByName(`panelEntityButton[${i}]`);
			panelEntButton.size = '0 0 60 60';
			setPanelObjectPosition(panelEntButton, i, Infinity);
		}
	}

	resize(length)
	{
		const PAD = 5;
		this.lastPlayerLength = length;
		const shortGameInfosLabelsPAD = g_IsObserver ? this.shortGameInfosLabels.size.bottom : "";
		let y = (26 * (length + 1) + shortGameInfosLabelsPAD);
		this.statsTopPanel.root.size = `0 ${shortGameInfosLabelsPAD} 1000 ${y}`;
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
		Engine.ConfigDB_CreateAndWriteValueToFile("user", "boongui.statsmode.checkbox", this.statsModes.root.hidden ? 'true' : 'false', "config/user.cfg");
		this.statsModes.root.hidden = !this.checkbox.checked;
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

		viewPlayer.hidden = !g_IsObserver && !this.playerViewControl.changePerspective;
		diplomacy.hidden = !isPlayer;
		trade.hidden = !isPlayer;
		optionFollowPlayer.hidden = !(g_IsObserver && isPlayer);

		// Future Project make the menu button only visible when you move the mouse to the top right corner
		// const gameSpeed = Engine.GetGUIObjectByName("gameSpeedButton");
		// const menuButton = Engine.GetGUIObjectByName("menuButton");
		// gameSpeed.onMouseEnter = function()
		// {
		// 	menuButton.hidden = false;
		// };
		// menuButton.onMouseLeave = function()
		// {
		// 	menuButton.hidden = true;
		// 	// const firstElement = buttonName.map((x) => x[0]);
		// 	// const indexNumberMenuButton = firstElement.findIndex((x) => x == menuButton);
		// };

		const buttonName = [[trade], [diplomacy], [objectives], [optionFollowPlayer], [viewPlayer], [gameSpeed], [menuButton]];
		for (var i = 0; i < buttonName.length; i++)
		{
			const widthButton = buttonName[i][0].size.right - buttonName[i][0].size.left;
			buttonName[i].push(Math.abs(widthButton));
		}

		let remainingWidth = buttonName.reduce((v, c) => v + (c[0].hidden ? 0 : c[1]), 0);

		topPanel.size = "100%-" + remainingWidth + " 0 100%+3 34";

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
	}

	updateShortGameInfosLabels()
	{
		this.mapCache = new MapCache();
		this.shortGameInfosLabels.hidden = !g_IsObserver || g_ViewedPlayer > 0;
		this.shortGameInfosLabels.caption = Engine.IsAtlasRunning() ? "" : sprintf("%(icon_alpha)s A25  %(icon_map)s %(mapName)s%(mapSize)s%(biome)s  %(icon_pop)s %(pop)s%(duration)s%(rating)s", {
			"icon_alpha": '[icon="icon_alpha" displace="1 5"]',
			"icon_map": '[icon="icon_map" displace="2 6"]',
			"mapName": this.mapCache.translateMapName(this.mapCache.getTranslatableMapName(g_InitAttributes.mapType, g_InitAttributes.map)),
			"mapSize": g_InitAttributes.mapType == "random" ? " - " + g_MapSizes.Name[g_MapSizes.Tiles.indexOf(g_InitAttributes.settings.Size)] : "",
			"biome": g_InitAttributes.settings.Biome ? " - " + g_Settings.Biomes.find(b => b.Id == g_InitAttributes.settings.Biome).Title : "",
			"icon_pop": '[icon="icon_pop" displace="3 5"]',
			"pop": g_InitAttributes.settings.PopulationCap !== undefined ? g_PopulationCapacities.Title[g_PopulationCapacities.Population.indexOf(g_InitAttributes.settings.PopulationCap)] : g_WorldPopulationCapacities.Title[g_WorldPopulationCapacities.Population.indexOf(g_InitAttributes.settings.WorldPopulationCap)] + " (WP)",
			"rating": g_InitAttributes.settings.RatingEnabled === true ? '  [icon="icon_rating" displace="-3 5"]' + coloredText("Rated", "red") : "",
			"duration": this.durationReplay()
		});
	}

	durationReplay()
	{
		const directory = Engine.GetCurrentReplayDirectory();
		return Engine.HasReplayMetadata(directory) ? '  [icon="icon_duration" displace="1 3"]' + timeToString(Engine.GetReplayMetadata(directory).timeElapsed) : "";
	}
}

BoonGUIStats.prototype.IncomeRateBufferSize = 50;


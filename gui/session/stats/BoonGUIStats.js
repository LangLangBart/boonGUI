class BoonGUIStats {

	constructor() {
		this.root = Engine.GetGUIObjectByName("Stats");
		this.shouldForceRender = true;
		this.statsTopPanel = new BoonGUIStatsTopPanel(() => this.shouldForceRender);
		this.statsModes = new BoonGUIStatsModes(() => this.shouldForceRender);
		this.resourcesBuffer = new Map();
		this.lastPlayerLength = null;

		this.resizeInit();
		registerPlayersFinishedHandler(this.onPlayersFinished.bind(this));
		this.root.hidden = !g_IsObserver;
		this.root.onTick = this.onTick.bind(this);
	}

	lastTick = 0;

	toggle() {
		this.root.hidden = !this.root.hidden;
		this.shouldForceRender = true;
	}

	onTick() {
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
		if (g_ViewedPlayer == -1)
			this.root.hidden = false;
	}

	playerColor(state) {
		return rgbToGuiColor(g_DiplomacyColors.displayedPlayerColors[state.index]);
	}

	teamColor(state) {
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

	resizeInit() {
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
			Engine.GetGUIObjectByName(`panelEntityButton[${i}]`).size = '0 0 60 60';
		}
	}

	resize(length) {
		const PAD = 5;
		this.lastPlayerLength = length;

		let y = (26 * (length + 1)) + 36;
		this.statsTopPanel.root.size = `0 36 1000 ${y}`;
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

	calculateResourceRates(state) {
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

	getPlayersStates() {
		return Engine.GuiInterfaceCall("boongui_GetOverlay", {
			g_IsObserver, g_ViewedPlayer, g_LastTickTime
		}).players ?? [];
	}

	update() {
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
		this.statsModes.update(playersStates, this.mode);
		Engine.ProfileStop();

		Engine.ProfileStop();
	}
}

BoonGUIStats.prototype.IncomeRateBufferSize = 50;

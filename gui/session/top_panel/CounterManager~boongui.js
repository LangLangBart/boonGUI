CounterManager.prototype.rebuild = function()
{
	const hidden = g_ViewedPlayer <= 0;
	this.resourceCounts.hidden = hidden;
	if (hidden)
		return;

	const viewedPlayerState = g_SimState.players[g_ViewedPlayer];
	this.allyPlayerStates = {};
	for (const player in g_SimState.players)
		if (player != 0 &&
			player != g_ViewedPlayer &&
			g_SimState.players[player].state != "defeated" &&
			(g_IsObserver ||
				viewedPlayerState.hasSharedLos &&
				g_SimState.players[player].isMutualAlly[g_ViewedPlayer]))
			this.allyPlayerStates[player] = g_SimState.players[player];

	this.selectedOrder = +Engine.ConfigDB_GetValue("user", "gui.session.respoptooltipsort");
	this.orderTooltip = this.getOrderTooltip();

	for (const counter of this.counters)
	{
		const hidden = g_ViewedPlayer <= 0;
		counter.panel.hidden = hidden;
		if (!hidden)
			counter.rebuild(viewedPlayerState, this.getAllyStatTooltip.bind(this));
	}
};

PlayerViewControl.prototype.rebuild = function()
{
	this.viewPlayer.list_data = [-1].concat(g_Players.map((player, i) => i));
	this.viewPlayer.list = [translate(this.ObserverTitle)].concat(g_Players.map(
		(player, i) => colorizePlayernameHelper(player.name, i)
	));
	this.viewPlayer.hidden = !g_IsObserver && !this.changePerspective;
};

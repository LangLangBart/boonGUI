DiplomacyDialogPlayerControl.prototype.TributeButtonManager.prototype.TributeButton.prototype.update = function(playerInactive)
{
	this.button.hidden = playerInactive;
	this.displayEnemyTributeButtons = Engine.GetGUIObjectByName("displayEnemyTributeButtons");
	this.displayEnemyTributeButtons.hidden = g_Players[g_ViewedPlayer].state != "active";

	// Checkbox implemented because it is sometimes necessary or just fun to send resources to the enemy.
	if (this.displayEnemyTributeButtons.checked == false)
		this.button.hidden = playerInactive || g_Players[g_ViewedPlayer].isEnemy[this.playerID];
	if (!this.button.hidden)
		this.button.enabled = controlsPlayer(g_ViewedPlayer);
};

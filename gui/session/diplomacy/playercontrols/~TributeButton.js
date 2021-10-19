
DiplomacyDialogPlayerControl.prototype.TributeButtonManager.prototype.TributeButton.prototype.update = function(playerInactive)
{		
	//kadu hack - Disable ability to sent resources to enemy - avoid misclicks in team games
	//			- enable via adding boongui.session.gui.diplomacy.set.tributeonlyteam = "true" to user.cfg
	//this.button.hidden = playerInactive;
		
	var tributeonlyteam = Engine.ConfigDB_GetValue("user","boongui.session.gui.diplomacy.set.tributeonlyteam");			
	if(tributeonlyteam == "true" ) {
		this.button.hidden = playerInactive || g_Players[g_ViewedPlayer].isEnemy[this.playerID]; 
	} else { 
		this.button.hidden = playerInactive;  
	}
	if (!this.button.hidden)
		this.button.enabled = controlsPlayer(g_ViewedPlayer);
}
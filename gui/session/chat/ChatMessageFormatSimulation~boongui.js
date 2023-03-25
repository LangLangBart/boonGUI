// Remove the last "period" in some messages, ".slice(0, -1)" would work too, but regex is safer
const Regex_Period = /\.$/;

ChatMessageFormatSimulation.attack.prototype.parse = function(msg)
{
	if (msg.player != g_ViewedPlayer)
		return "";

	const message = msg.targetIsDomesticAnimal ?
		translate("%(icon)sYour livestock has been attacked by %(attacker)s!") :
		translate("%(icon)sYou have been attacked by %(attacker)s!");

	return {
		"text": sprintf(message, {
			"icon": '[icon="icon_focusattacked" displace="0 1"]',
			"attacker": colorizePlayernameByID(msg.attacker)
		}),
		"callback": ((target, position) => function() {
			focusAttack({ target, position });
		})(msg.target, msg.position),
		"tooltip": translate("Click to focus on the attacked unit.")
	};
};

ChatMessageFormatSimulation.phase.prototype.parse = function(msg)
{
	const notifyPhase = Engine.ConfigDB_GetValue("user", "gui.session.notifications.phase");
	if (notifyPhase == "none" || msg.player != g_ViewedPlayer && !g_IsObserver && !g_Players[msg.player].isMutualAlly[g_ViewedPlayer])
		return "";

	let message = "";
	if (notifyPhase == "all")
	{
		if (msg.phaseState == "started")
			message = translate("%(player)s is advancing to the %(phaseName)s.");
		else if (msg.phaseState == "aborted")
			message = translate("The %(phaseName)s of %(player)s has been aborted.");
	}
	if (msg.phaseState == "completed")
		message = translate("%(player)s has reached the %(phaseName)s.");

	if (!message)
		return "";
	message = `%(time)s ${message}`;
	return {
		"text": coloredText(sprintf(message.replace(Regex_Period, ""), {
			"time": Engine.FormatMillisecondsIntoDateStringLocal(g_SimState.timeElapsed, translate("m:ss")),
			"player": colorizePlayernameByID(msg.player),
			"phaseName": getEntityNames(GetTechnologyData(msg.phaseName, g_Players[msg.player]))
		}), brightenedColor(rgbToGuiColor(g_DiplomacyColors.displayedPlayerColors[msg.player])))
	};
};

ChatMessageFormatSimulation.barter.prototype.parse = function(msg)
{
	if (!g_IsObserver || Engine.ConfigDB_GetValue("user", "gui.session.notifications.barter") != "true")
		return "";

	const amountGiven = {};
	amountGiven[msg.resourceGiven] = msg.amountGiven;

	const amountGained = {};
	amountGained[msg.resourceGained] = msg.amountGained;

	return {
		"text": sprintf(translate("%(player)s bartered %(amountGiven)s for %(amountGained)s.").replace(Regex_Period, ""), {
			"player": colorizePlayernameByID(msg.player),
			"amountGiven": getLocalizedResourceAmounts(amountGiven, "200 0 0"),
			"amountGained": getLocalizedResourceAmounts(amountGained, "0 200 0")
		})
	};
};

ChatMessageFormatSimulation.tribute.prototype.parse = function(msg)
{
	let message, color;
	if (msg.targetPlayer == Engine.GetPlayerID())
	{
		message = translate("%(player)s has sent you %(amounts)s.");
		color = "0 200 0";
	}
	else if (msg.sourcePlayer == Engine.GetPlayerID())
	{
		message = translate("You have sent %(player2)s %(amounts)s.");
		color = "200 0 0";
	}
	else if (Engine.ConfigDB_GetValue("user", "gui.session.notifications.tribute") == "true" &&
		(g_IsObserver || g_InitAttributes.settings.LockTeams &&
			g_Players[msg.sourcePlayer].isMutualAlly[Engine.GetPlayerID()] &&
			g_Players[msg.targetPlayer].isMutualAlly[Engine.GetPlayerID()]))
		message = translate("%(player)s has sent %(player2)s %(amounts)s.");

	return {
		"text": sprintf(message?.replace(Regex_Period, ""), {
			"player": colorizePlayernameByID(msg.sourcePlayer),
			"player2": colorizePlayernameByID(msg.targetPlayer),
			"amounts": getLocalizedResourceAmounts(msg.amounts, color)
		})
	};
};

/**
 * These classes construct a chat message from simulation events initiated from the GuiInterface PushNotification method.
 */
class ChatMessageFormatSimulation
{
}

ChatMessageFormatSimulation.attack = class
{
	parse(msg)
	{
		if (msg.player != g_ViewedPlayer)
			return "";

		const message = msg.targetIsDomesticAnimal ?
			translate("%(icon)s Livestock attacked by %(attacker)s!") :
			translate("%(icon)s Attacked by %(attacker)s!");

		return {
			"text": sprintf(message, {
				"icon": '[icon="icon_focusattacked" displace="0 1"]',
				"attacker": colorizePlayernameByIDReturnNick(msg.attacker)
			}),
			"callback": ((target, position) => function()
			{
				focusAttack({ "target": target, "position": position });
			})(msg.target, msg.position),
			"tooltip": translate("Click to focus on the attacked unit.")
		};
	}
};

ChatMessageFormatSimulation.barter = class
{
	parse(msg)
	{
		if (!g_IsObserver || Engine.ConfigDB_GetValue("user", "gui.session.notifications.barter") != "true")
			return "";

		const amountGiven = {};
		amountGiven[msg.resourceGiven] = msg.amountGiven;

		const amountGained = {};
		amountGained[msg.resourceGained] = msg.amountGained;

		return {
			"text": sprintf(translate("%(player)s bartered %(amountGiven)s for %(amountGained)s"), {
				"player": colorizePlayernameByIDReturnNick(msg.player),
				"amountGiven": getLocalizedResourceAmounts(amountGiven),
				"amountGained": getLocalizedResourceAmounts(amountGained)
			})
		};
	}
};

ChatMessageFormatSimulation.diplomacy = class
{
	parse(msg)
	{
		let messageType;

		if (g_IsObserver)
			messageType = "observer";
		else if (Engine.GetPlayerID() == msg.sourcePlayer)
			messageType = "active";
		else if (Engine.GetPlayerID() == msg.targetPlayer)
			messageType = "passive";
		else
			return "";

		return {
			"text": sprintf(translate(this.strings[messageType][msg.status]), {
				"player": colorizePlayernameByIDReturnNick(messageType == "active" ? msg.targetPlayer : msg.sourcePlayer),
				"player2": colorizePlayernameByIDReturnNick(messageType == "active" ? msg.sourcePlayer : msg.targetPlayer)
			})
		};
	}
};

ChatMessageFormatSimulation.diplomacy.prototype.strings = {
	"active": {
		"ally": markForTranslation("You are now allied with %(player)s"),
		"enemy": markForTranslation("You are now at war with %(player)s"),
		"neutral": markForTranslation("You are now neutral with %(player)s")
	},
	"passive": {
		"ally": markForTranslation("%(player)s is now allied with you"),
		"enemy": markForTranslation("%(player)s is now at war with you"),
		"neutral": markForTranslation("%(player)s is now neutral with you")
	},
	"observer": {
		"ally": markForTranslation("%(player)s is now allied with %(player2)s"),
		"enemy": markForTranslation("%(player)s is now at war with %(player2)s"),
		"neutral": markForTranslation("%(player)s is now neutral with %(player2)s")
	}
};

ChatMessageFormatSimulation.phase = class
{
	parse(msg)
	{
		const notifyPhase = Engine.ConfigDB_GetValue("user", "gui.session.notifications.phase");
		if (notifyPhase == "none" || msg.player != g_ViewedPlayer && !g_IsObserver && !g_Players[msg.player].isMutualAlly[g_ViewedPlayer])
			return "";

		let message = "";
		if (notifyPhase == "all")
		{
			if (msg.phaseState == "started")
				message = coloredText(translate("%(time)s %(player)s started %(phaseName)s"), rgbToGuiColor(g_DiplomacyColors.displayedPlayerColors[msg.player]));
			else if (msg.phaseState == "aborted")
				message = translate("%(player)s aborted %(phaseName)s");
		}
		if (msg.phaseState == "completed")
			message = coloredText(translate("%(time)s %(player)s reached %(phaseName)s"), rgbToGuiColor(g_DiplomacyColors.displayedPlayerColors[msg.player]));

		return {
			"text": sprintf(message, {
				"time": Engine.FormatMillisecondsIntoDateStringLocal(g_SimState.timeElapsed, translate("m:ss")),
				"player": colorizePlayernameByIDReturnNick(msg.player),
				"phaseName": getEntityNames(GetTechnologyData(msg.phaseName, g_Players[msg.player]))
			})
		};
	}
};

ChatMessageFormatSimulation.playerstate = class
{
	parse(msg)
	{
		if (!msg.message.pluralMessage)
			return {
				"text": sprintf(translate(msg.message), {
					"player": colorizePlayernameByIDReturnNick(msg.players[0])
				})
			};

		const mPlayers = msg.players.map(playerID => colorizePlayernameByIDReturnNick(playerID));
		const lastPlayer = mPlayers.pop();

		return {
			"text": sprintf(translatePlural(msg.message.message, msg.message.pluralMessage, msg.message.pluralCount), {
				// Translation: This comma is used for separating first to penultimate elements in an enumeration.
				"players": mPlayers.join(translate(", ")),
				"lastPlayer": lastPlayer
			})
		};
	}
};

/**
 * Optionally show all tributes sent in observer mode and tributes sent between allied players.
 * Otherwise, it will show the posts sent directly to us and the posts sent by us.
 */
ChatMessageFormatSimulation.tribute = class
{
	parse(msg)
	{
		let message = "";
		if (msg.targetPlayer == Engine.GetPlayerID())
			message = translate("%(player)s has sent you %(amounts)s");
		else if (msg.sourcePlayer == Engine.GetPlayerID())
			message = translate("You have sent %(player2)s %(amounts)s");
		else if (Engine.ConfigDB_GetValue("user", "gui.session.notifications.tribute") == "true" &&
			(g_IsObserver || g_InitAttributes.settings.LockTeams &&
				g_Players[msg.sourcePlayer].isMutualAlly[Engine.GetPlayerID()] &&
				g_Players[msg.targetPlayer].isMutualAlly[Engine.GetPlayerID()]))
			message = translate("%(player)s has sent %(player2)s %(amounts)s");

		return {
			"text": sprintf(message, {
				"player": colorizePlayernameByIDReturnNick(msg.sourcePlayer),
				"player2": colorizePlayernameByIDReturnNick(msg.targetPlayer),
				"amounts": getLocalizedResourceAmounts(msg.amounts)
			})
		};
	}
};

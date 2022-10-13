/**
 * The profile page enables the player to lookup statistics of an arbitrary player.
 */
class ProfilePage
{
	constructor(xmppMessages)
	{
		this.requestedPlayer = undefined;
		this.closePageHandlers = new Set();

		this.profilePage = Engine.GetGUIObjectByName("profilePage");

		this.fetchInput = Engine.GetGUIObjectByName("fetchInput");
		this.fetchInput.onPress = this.onPressLookup.bind(this);
		this.fetchInput.onTab = this.autocomplete.bind(this);
		this.fetchInput.tooltip = colorizeAutocompleteHotkey();

		Engine.GetGUIObjectByName("viewProfileButton").onPress = this.onPressLookup.bind(this);
		Engine.GetGUIObjectByName("profileBackButton").onPress = this.onPressClose.bind(this, true);

		this.profileRankIcon = Engine.GetGUIObjectByName("profileRankIcon");
		this.profileRoleText = Engine.GetGUIObjectByName("profileRoleText");
		this.profilePlayernameText = Engine.GetGUIObjectByName("profilePlayernameText");
		this.profileRankText = Engine.GetGUIObjectByName("profileRankText");
		this.profileHighestRatingText = Engine.GetGUIObjectByName("profileHighestRatingText");
		this.profileTotalGamesText = Engine.GetGUIObjectByName("profileTotalGamesText");
		this.profileWinsText = Engine.GetGUIObjectByName("profileWinsText");
		this.profileLossesText = Engine.GetGUIObjectByName("profileLossesText");
		this.profileRatioText = Engine.GetGUIObjectByName("profileRatioText");
		this.profileErrorText = Engine.GetGUIObjectByName("profileErrorText");
		this.profileWindowArea = Engine.GetGUIObjectByName("profileWindowArea");

		xmppMessages.registerXmppMessageHandler("game", "profile", this.onProfile.bind(this));
	}

	registerClosePageHandler(handler)
	{
		this.closePageHandlers.add(handler);
	}

	openPage()
	{
		this.profilePage.hidden = false;
		Engine.SetGlobalHotkey("cancel", "Press", this.onPressClose.bind(this));
	}

	onPressLookup()
	{
		this.requestedPlayer = this.fetchInput.caption;
		Engine.SendGetProfile(this.requestedPlayer);
	}

	autocomplete()
	{
		const listPlayerNames = Engine.GetPlayerList().map(player => escapeText(player.name));
		// Remove duplicates with the board list. The board list has lower case names.
		const listPlayerNamesLower = listPlayerNames.map(playerName => playerName.toLowerCase());
		for (const entry of Engine.GetBoardList())
		{
			const escapedName = escapeText(entry.name);
			if (!listPlayerNamesLower.includes(escapedName))
				listPlayerNames.push(escapedName);
		}
		autoCompleteText(this.fetchInput, listPlayerNames);
	}

	onPressClose()
	{
		this.profilePage.hidden = true;

		for (const handler of this.closePageHandlers)
			handler();
	}

	onProfile()
	{
		const attributes = Engine.GetProfile()[0];
		if (this.profilePage.hidden || this.requestedPlayer != attributes.player)
			return;

		const profileFound = attributes.rating != "-2";
		this.profileWindowArea.hidden = !profileFound;
		this.profileErrorText.hidden = profileFound;

		if (!profileFound)
		{
			this.profileErrorText.caption =
				sprintf(translate("Player \"%(nick)s\" not found."), {
					"nick": escapeText(attributes.player)
				});
			return;
		}

		this.profilePlayernameText.caption = PlayerColor.ColorPlayerName(escapeText(attributes.player), attributes.rating);
		this.profileRankText.caption = attributes.rank;
		this.profileHighestRatingText.caption = attributes.highestRating;
		this.profileTotalGamesText.caption = attributes.totalGamesPlayed;
		this.profileWinsText.caption = attributes.wins;
		this.profileLossesText.caption = attributes.losses;
		this.profileRatioText.caption = ProfilePanel.FormatWinRate(attributes);
		const ratingNumberIcon = parseInt(attributes.rating, 10);

		switch (true)
		{
		case (attributes.rank == "1"):
			this.profileRoleText.caption = "Ruler";
			this.profileRankIcon.caption = sprintf("%(icon_highest_rank)s", { "icon_highest_rank": '[icon="icon_highest_rank" displace="0 3"]' });
			return;
		case (ratingNumberIcon > 1600):
			this.profileRoleText.caption = "Conqueror";
			this.profileRankIcon.caption = sprintf("%(icon_above_1600)s", { "icon_above_1600": '[icon="icon_above_1600" displace="0 3"]' });
			return;
		case (ratingNumberIcon > 1400):
			this.profileRoleText.caption = "Champion";
			this.profileRankIcon.caption = sprintf("%(icon_above_1400)s", { "icon_above_1400": '[icon="icon_above_1400" displace="0 3"]' });
			return;
		case (ratingNumberIcon > 1200):
			this.profileRoleText.caption = "Warrior";
			this.profileRankIcon.caption = sprintf("%(icon_above_1200)s", { "icon_above_1200": '[icon="icon_above_1200" displace="0 3"]' });
			return;
		case (ratingNumberIcon > 1000):
			this.profileRoleText.caption = "Footsoldier";
			this.profileRankIcon.caption = sprintf("%(icon_above_1000)s", { "icon_above_1000": '[icon="icon_above_1000" displace="0 3"]' });
			return;
		case (ratingNumberIcon <= 1000):
			this.profileRoleText.caption = "noob";
			this.profileRankIcon.caption = sprintf("%(icon_below_1000)s", { "icon_below_1000": '[icon="icon_below_1000" displace="0 3"]' });
			return;
		default:
			this.profileRankIcon.caption = "";
			return;
		}
	}
}

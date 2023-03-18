/**
 * This class stores the handlers for all GUI objects in the lobby page,
 * (excluding other pages in the same context such as leaderboard and profile page).
 */
class LobbyPage
{
	constructor(dialog, xmppMessages, leaderboardPage, profilePage)
	{
		Engine.ProfileStart("Create LobbyPage");
		const mapCache = new MapCache();
		const buddyButton = new BuddyButton(xmppMessages);
		const gameList = new GameList(xmppMessages, buddyButton, mapCache);
		const playerList = new PlayerList(xmppMessages, buddyButton, gameList);

		this.lobbyPage = {
			"buttons": {
				"buddyButton": buddyButton,
				"hostButton": new HostButton(dialog, xmppMessages),
				"forumButton": new ForumButton(),
				"hotkeyButton": new HotkeyButton(),
				"joinButton": new JoinButton(dialog, gameList),
				"lastSummaryButton": new LastSummaryButton(dialog),
				"leaderboardButton": new LeaderboardButton(xmppMessages, leaderboardPage),
				"optionsButton": new OptionsButton(),
				"profileButton": new ProfileButton(xmppMessages, profilePage),
				"quitButton": new QuitButton(dialog, leaderboardPage, profilePage),
				"replayButton": new ReplayButton(dialog),
				"civilizationLobbyButton": new CivilizationLobbyButton()

			},
			"panels": {
				"chatPanel": new ChatPanel(xmppMessages),
				"gameDetails": new GameDetails(dialog, gameList, mapCache),
				"gameList": gameList,
				"playerList": playerList,
				"profilePanel": new ProfilePanel(xmppMessages, playerList, leaderboardPage),
				"subject": new Subject(dialog, xmppMessages, gameList)
			},
			"eventHandlers": {
				"announcementHandler": new AnnouncementHandler(xmppMessages),
				"connectionHandler": new ConnectionHandler(xmppMessages)
			}
		};

		if (dialog)
			this.setDialogStyle();
		Engine.ProfileStop();
	}

	setDialogStyle()
	{
		{
			const lobbyPage = Engine.GetGUIObjectByName("lobbyPage");
			lobbyPage.sprite = "ModernDialog";

			const size = lobbyPage.size;
			size.left = this.WindowMargin;
			size.top = this.WindowMargin;
			size.right = -this.WindowMargin;
			size.bottom = -this.WindowMargin;
			lobbyPage.size = size;
		}

		{
			const lobbyPageTitle = Engine.GetGUIObjectByName("lobbyPageTitle");
			const size = lobbyPageTitle.size;
			size.top -= this.WindowMargin / 2;
			size.bottom -= this.WindowMargin / 2;
			lobbyPageTitle.size = size;
		}

		{
			const lobbyPanels = Engine.GetGUIObjectByName("lobbyPanels");
			const size = lobbyPanels.size;
			size.top -= this.WindowMargin / 2;
			lobbyPanels.size = size;
		}
	}
}

LobbyPage.prototype.WindowMargin = 40;

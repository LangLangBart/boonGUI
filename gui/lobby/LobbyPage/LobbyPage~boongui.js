/**
 * This class stores the handlers for all GUI objects in the lobby page,
 * (excluding other pages in the same context such as leaderboard and profile page).
 */
class LobbyPage_boonGUI extends LobbyPage
{
	constructor(dialog, xmppMessages, leaderboardPage, profilePage)
	{
		super(dialog, xmppMessages, leaderboardPage, profilePage);
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
}
LobbyPage = LobbyPage_boonGUI;

/**
 * This class manages the button that allows the player to go to the forum.
 */
class ForumButton
{
	constructor()
	{
		this.forumButton = Engine.GetGUIObjectByName("forumButton");
		this.forumButton.onPress = this.onPress.bind(this);
		this.forumButton.caption = translate("Forum");
	}

	onPress()
	{
		Engine.OpenURL("https://wildfiregames.com/forum/index.php?/discover/");
	}
}

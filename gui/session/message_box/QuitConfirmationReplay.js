/**
 * This class is concerned with opening a message box if the game is in replaymode and that replay ended.
 */
class QuitConfirmationReplay extends SessionMessageBox
{
	constructor()
	{
		super();
		Engine.GetGUIObjectByName("session").onReplayFinished = this.display.bind(this);
	}
}

QuitConfirmationReplay.prototype.Title = setStringTags("Replay Finished", { "font": "sans-bold-16" });

QuitConfirmationReplay.prototype.Caption = "";

QuitConfirmationReplay.prototype.Buttons =
[
	{
		"caption": translateWithContext("replayFinished", "< Stay")
	},
	{
		"caption": translateWithContext("replayFinished", "Summary >"),
		"onPress": () => { endGame(true); }
	},
	{
		"caption": translateWithContext("replayFinished", "Quit >>"),
		"onPress": () => { endGame(false); }
	}
];

QuitConfirmationReplay.prototype.Width = 400;
QuitConfirmationReplay.prototype.Height = 70;

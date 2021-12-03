class QuitConfirmation extends SessionMessageBox
{
}

QuitConfirmation.prototype.Title = setStringTags("Game Finished", { "font": "sans-bold-16" });

QuitConfirmation.prototype.Caption = "";

QuitConfirmation.prototype.Buttons =
[
	{
		"caption": translateWithContext("gameFinished", "< Stay")
	},
	{
		"caption": translateWithContext("gameFinished", "Summary >"),
		"onPress": () => { endGame(true); }
	},
	{
		"caption": translateWithContext("gameFinished", "Quit >>"),
		"onPress": () => { endGame(false); }
	}
];

QuitConfirmation.prototype.Width = 400;
QuitConfirmation.prototype.Height = 70;

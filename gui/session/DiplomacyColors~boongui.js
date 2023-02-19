/**
 * BoonGUIDiplomacyColors class modifies the "computeTeamColors()" method
 * of the DiplomacyColors class to hard-code the diplomacy colors.
 */
class BoonGUIDiplomacyColors extends DiplomacyColors
{
	computeTeamColors()
	{
		if (!this.enabled)
		{
			this.displayedPlayerColors = g_Players.map(player => player.color);
			return;
		}

		const teamRepresentatives = {};
		for (let i = 1; i < g_Players.length; ++i)
			if (g_ViewedPlayer <= 0)
			{
				// Observers and gaia see team colors
				const team = g_Players[i].state == "active" ? g_Players[i].team : -1;
				this.displayedPlayerColors[i] = g_Players[teamRepresentatives[team] || i].color;
				if (team != -1 && !teamRepresentatives[team])
					teamRepresentatives[team] = i;
			}
			else
				// Players see colors depending on diplomacy
				this.displayedPlayerColors[i] =
					g_ViewedPlayer == i ? g_vividColorsGamesetup.vividBlue :
						g_Players[g_ViewedPlayer].isAlly[i] ? g_vividColorsGamesetup.vividGreen :
							g_Players[g_ViewedPlayer].isNeutral[i] ? g_vividColorsGamesetup.vividYellow :
								g_vividColorsGamesetup.vividRed;

		this.displayedPlayerColors[0] = g_Players[0].color;
	}
}

DiplomacyColors = BoonGUIDiplomacyColors;

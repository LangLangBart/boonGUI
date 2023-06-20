const g_BoonGUIResTypes = ["food", "wood", "stone", "metal"];

/**
 * @param {number} index
 * @param {number} height
 */
function BoonGUIGetRowSize(index, height)
{
	const y1 = height * index;
	const y2 = height * (index + 1);
	return `0 ${y1} 100% ${y2}`;
}

/**
 * @param {number} index
 * @param {number} width
 * @param {boolean} rtl
 */
function BoonGUIGetColSize(index, width, rtl = false)
{
	const x1 = width * index;
	const x2 = width * (index + 1);
	return rtl ? `100%-${x2} 0 100%-${x1} 100%` : `${x1} 0 ${x2} 100%`;
}

/**
 * When a fully constructed civic center (CC) exits, the camera is focused at it. If no CC is present, a sound is played.
 * @param  {boolean} move
 * @param  {Object} state
 */
function focusCC(move, state)
{
	if (state == null || state.civCentres.length <= 0)
	{
		Engine.PlayUISound("audio/interface/alarm/alarm_invalid_building_placement_01.ogg", false);
		return;
	}
	if (!Engine.HotkeyIsPressed("selection.add"))
		g_Selection.reset();

	g_Selection.addList(state.civCentres);

	if (move)
	{
		const entState = GetEntityState(state.civCentres[0]);
		Engine.CameraMoveTo(entState.position.x, entState.position.z);
	}
}
/**
 *
 * @param {string} civName
 */
function openStructTree(civName)
{
	closeOpenDialogs();
	g_PauseControl.implicitPause();

	Engine.PushGuiPage(
		BoonGUIStatsTopPanelRow.prototype.civInfo.page,
		{
			"civ": civName || g_Players[Math.max(g_ViewedPlayer, 1)].civ
		},
		storeCivInfoPage);
}
/**
 *
 * @param {object} data
 */
function storeCivInfoPage(data)
{
	if (data.nextPage)
		Engine.PushGuiPage(
			data.nextPage,
			{ "civ": data.civ },
			storeCivInfoPage);
	else
	{
		BoonGUIStatsTopPanelRow.prototype.civInfo = data;
		resumeGame();
	}
}

/**
 * @param {Object} objectPlayer
 * @param {string} playerName
 * @param {Object} objectRating
 * @param {number} rating
 * @param {number} smallSafetyMargin
 * @returns abbreviated player name with an elipsses if too long
 */
function limitPlayerName(objectPlayer, playerName, objectRating, rating, smallSafetyMargin = 8)
{
	// check if a cached version is already available
	if (BoonGUIStatsTopPanelRow.prototype.abbreviatedPlayerNames[playerName])
		return BoonGUIStatsTopPanelRow.prototype.abbreviatedPlayerNames[playerName];

	const { "right": objectPlayertRight, "left": objectPlayertLeft } = objectPlayer.getComputedSize();
	let widthBox = objectPlayertRight - objectPlayertLeft;
	widthBox -= smallSafetyMargin;
	if (rating)
	{
		const { "right": objectRatingtRight, "left": objectRatingtLeft } = objectRating.getComputedSize();
		widthBox -= (objectRatingtRight - objectRatingtLeft);
	}
	let abbreviatedName = playerName;
	let playerNameLength = Engine.GetTextWidth(objectPlayer.font, abbreviatedName);

	for (let i = 1; playerNameLength > widthBox; i++)
	{
		abbreviatedName = `${playerName.slice(0, -i)}…`;
		playerNameLength = Engine.GetTextWidth(objectPlayer.font, abbreviatedName);
	}

	BoonGUIStatsTopPanelRow.prototype.abbreviatedPlayerNames[playerName] = abbreviatedName;
	return BoonGUIStatsTopPanelRow.prototype.abbreviatedPlayerNames[playerName];

}

const normalizeResourceCount = value =>
	// regex to avoid trailing zeros
	value >= 1e6 ?
		Math.floor(value / 1e6) + setStringTags("M", { "font": "sans-stroke-12" }) :
		value >= 1e5 ?
			Math.floor(value / 1e3) + setStringTags("k", { "font": "sans-stroke-12" }) :
			value >= 1e3 ?
				(value / 1e3).toFixed(1).replace(/\.0$/, "") + setStringTags("k", { "font": "sans-stroke-12" }) :
			// for rounding number to its tenth
				Math.floor(value / 10) * 10;

const normalizeValue = value =>
	value >= 1e4 ?
		Math.floor(value / 1e3) + setStringTags("k", { "font": "mono-10" }) :
		value >= 1e3 ?
			(value / 1e3).toFixed(1).replace(/\.0$/, "") + setStringTags("k", { "font": "mono-10" }) :
			value;

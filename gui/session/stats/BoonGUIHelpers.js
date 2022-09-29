const g_BoonGUICivs = {
	"gaia": "GAI",
	"athen": "ATH",
	"brit": "BRI",
	"cart": "CAR",
	"epir": "EPR",
	"gaul": "GAU",
	"goth": "GOT",
	"han": "HAN",
	"huns": "HUN",
	"iber": "IBE",
	"imp": "IMP",
	"kush": "KUS",
	"mace": "MAC",
	"maur": "MRY",
	"noba": "NOB",
	"pers": "PER",
	"ptol": "PTO",
	"rome": "ROM",
	"scyth": "SCY",
	"sele": "SEL",
	"spart": "SPA",
	"sueb": "SUB",
	"theb": "TEB",
	"xion": "XON",
	"zapo": "ZAP"
};

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
function openStrucTree(civName)
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
 *
 * @param {String} name Name of the player
 * @param {Number} limit1 shorter limit, uppercase letters need more space
 * @param {Number} limit2
 * @returns {String}
 */
function limitPlayerName(name, limit1 = 1, limit2 = 2)
{
	const isUpperCase = (name.match(/[A-Z]/g) || []).length;
	const limit = isUpperCase > 3 ? limit1 : limit2;
	return 	name.length <= limit ? name : name.substr(0, limit - 1) + "…";
}

function normalizeResourceCount(value)
{
	if (value >= 10000)
	{
		return Math.floor(value / 1000) + setStringTags("k", { "font": "sans-stroke-12" });
	}
	// for rounding number to its tenth
	return Math.floor(value / 10) * 10;
}

function normalizeValue(value)
{
	if (value >= 10000)
	{
		return Math.floor(value / 1000) + setStringTags("k", { "font": "mono-10" });
	}
	else if (value >= 1000)
	{
		return (value / 1000).toFixed(1) + setStringTags("k", { "font": "mono-10" });
	}
	return value;
}


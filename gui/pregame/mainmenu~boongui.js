var configboongui = {
	"needsToSave": false,
	"needsToReloadHotkeys": false,
	"set": function(key, value)
	{
		Engine.ConfigDB_CreateValue("user", key, value);
		this.needsToSave = true;
		this.needsToReloadHotkeys = this.needsToReloadHotkeys || key.startsWith("hotkey.");
	},
	"get": function(key) { return Engine.ConfigDB_GetValue("user", key); },
	"save": function()
	{
		if (this.needsToSave) Engine.ConfigDB_WriteFile("user", "config/user.cfg");
		if (this.needsToReloadHotkeys) Engine.ReloadHotkeys();
	}
};

function boongui_initCheck()
{
	const state = {
		"needsRestart": false,
		"reasons": [],
		"showMessage": false
	};

	// Check settings
	{
		const settings = Engine.ReadJSONFile("boongui_data/default_config.json");

		const allHotkeys = new Set(Object.keys(Engine.GetHotkeyMap()));
		// Normal check. Check for entries missing

		for (const key in settings)
		{
			if (!allHotkeys.has(key.substring("hotkey.".length)))
			{
				configboongui.set(key, settings[key]);
				state.showMessage = true;
			}
		}

		configboongui.save();


	}

	if (state.showMessage)
	{
		function addReason(title, hotkey)
		{
			state.reasons.push(setStringTags(`${title}:`, { "font": 'sans-bold-18' }));
			state.reasons.push(colorizeHotkey(`%(hotkey)s`, hotkey));
			state.reasons.push("");
		}

		addReason("Take the view of a unit", "boongui.camera.follow.fps");
		addReason("Toggle the stats overlay", "boongui.session.stats.toggle");
		addReason("Popup the quit dialog", "boongui.session.gui.exit");
		addReason("Next stats tab", "boongui.session.stats.nextMode");
		addReason("Previous stats tab", "boongui.session.stats.previousMode");
	}
	return state;
}

autociv_patchApplyN("init", function(target, that, args)
{
	const state = boongui_initCheck();
	if (state.showMessage)
	{
		const message = state.reasons.join("\n");
		const title = setStringTags("boonGUI hotkeys", { "font": "sans-bold-18" });
		messageBox(450, 400, message, title, ["Ok"], [() => { }]);
	}

	return target.apply(that, args);
});

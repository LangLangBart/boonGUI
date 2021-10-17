var configboongui = {
    needsToSave: false,
    needsToReloadHotkeys: false,
    set: function (key, value)
    {
        Engine.ConfigDB_CreateValue("user", key, value);
        this.needsToSave = true
        this.needsToReloadHotkeys = this.needsToReloadHotkeys || key.startsWith("hotkey.")
    },
    get: function (key) { return Engine.ConfigDB_GetValue("user", key) },
    save: function ()
    {
        if (this.needsToSave) Engine.ConfigDB_WriteFile("user", "config/user.cfg")
        if (this.needsToReloadHotkeys) Engine.ReloadHotkeys()
    }
}

function boongui_initCheck()
{
    let state = {
        "needsRestart": false,
        "reasons": new Set(),
    };

    // Check settings
    {
        let settings = Engine.ReadJSONFile("boongui_data/default_config.json");

        const allHotkeys = new Set(Object.keys(Engine.GetHotkeyMap()))
        // Normal check. Check for entries missing
        for (let key in settings)
        {
            if (!allHotkeys.has(key.substring("hotkey.".length)))
                {
                    configboongui.set(key, settings[key]);
                    state.reasons.add("Enter the view of a unit with:\nShift+F\n\nToggle the stats overlay with:\nAlt+Shift+F\n\nQuit a game with:\nShift+Escape");
                }
        }
    }

    configboongui.save()
    return state;
};

autociv_patchApplyN("init", function (target, that, args)
{
    let state = boongui_initCheck();
    if (state.reasons.size != 0)
    {
        let message = ["", ""].
            concat(Array.from(state.reasons).map(v => `  ${v}`)).
            join("");

        messageBox(450, 250, message,
            "boonGUI hotkeys:",
            ["Ok"],
            [() => { }]
        );
    }

    return target.apply(that, args);
})

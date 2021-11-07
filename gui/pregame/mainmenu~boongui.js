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
                    state.reasons.add("[font=\"sans-bold-18\"]" + "Take the view of a unit:\n" + "[/font]" + coloredText("\\[Shift+F]", "255 251 131") + "[font=\"sans-bold-18\"]" + "\n\nToggle the stats overlay:\n" + "[/font]" + coloredText("\\[Alt+Shift+F]", "255 251 131") + "[font=\"sans-bold-18\"]" + "\n\nOpen the quit dialog:\n" + "[/font]" + coloredText("\\[Shift+Escape]", "255 251 131"));
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

        messageBox(450, 300, message,
            "[font=\"sans-bold-18\"]" + "boonGUI hotkeys" + "[/font]",
            ["Ok"],
            [() => { }]
        );
    }

    return target.apply(that, args);
})

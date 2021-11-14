class BoonGUIStatsModes {

    static Modes = [
        "Production",
        "Units",
        "Buildings",
        "Military Buildings",
        "Economy Technologies",
        "Military Technologies",
        "Other Technologies",
    ];

    constructor(forceRender) {
        const PREFIX = "StatsModes";
        this.root = Engine.GetGUIObjectByName(PREFIX);
        this.mode = 0;

        this.dropdownContainer = Engine.GetGUIObjectByName(`${PREFIX}DropdownContainer`);
        this.dropdown = Engine.GetGUIObjectByName(`${PREFIX}Dropdown`);

        this.rowsContainer = Engine.GetGUIObjectByName(`${PREFIX}Rows`);
        this.rows = this.rowsContainer.children.map((row, index) => new BoonGUIStatsModesRow(row, index));

        this.root.size = `100%-400 200 100% 500`;
        this.dropdownContainer.size = '0 0 100% 25';
        this.rowsContainer.size = '0 30 100% 200';

        this.dropdown.list = BoonGUIStatsModes.Modes;
        this.dropdown.list_data = BoonGUIStatsModes.Modes;

        this.dropdown.onSelectionChange = this.onSelectionChange.bind(this);
        this.forceRender = forceRender;
    }

    onSelectionChange() {
        this.mode = this.dropdown.selected;
        this.forceRender();
    }

    toggleMode() {
        this.mode += 1;
        if (this.mode >= BoonGUIStatsModes.Modes.length) {
            this.mode = 0;
        }
        this.forceRender();
    }

    update(playersStates) {
        this.dropdown.selected = this.mode;
        this.rows.forEach((row, i) => row.update(playersStates[i], BoonGUIStatsModes.Modes[this.mode]));
    }
}

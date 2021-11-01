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
    "maur":"MRY", 
    "noba": "NOB", 
    "pers":"PER", 
    "ptol":"PTO",
    "rome": "ROM",
    "scyth": "SCY",
    "sele": "SEL",
    "spart": "SPA",
    "sueb": "SUB",
    "theb": "TEB",
    "xion":"XON",
    "zapo": "ZAP"
};

const BoonGUIGetSize = (rows) => {
    const y = (22 * (rows + 1)) + 4;
    return`0 36 1000 36+${y}`
}

const BoonGUIGetRowSize = (index) => {
    const y1 = 22 * index;
    const y2 = 22 * (index + 1);
    return `0 ${y1} 100% ${y2}`;
}

const BoonGUIGetColSize = (index) => {
    const x1 = 22 * index;
    const x2 = 22 * (index + 1);
    return `${x1} 0 ${x2} 100%`;
}

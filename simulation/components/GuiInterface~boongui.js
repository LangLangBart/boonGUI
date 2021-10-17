// Used to filter out some techs e.g. phases or civbonuses
Set.prototype.boongui_TechFilter = function filter(f) {
  const newSet = new Set();
  for (var v of this) if(f(v)) newSet.add(v);
  return newSet;
};

/**
 * Opimitzed stats function for boonGUI stats overlay
 */
GuiInterface.prototype.boongui_GetOverlay = function ()
{
    const ret = {
        "players": []
    };

    const cmpPlayerManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_PlayerManager);
    const numPlayers = cmpPlayerManager.GetNumPlayers();
    for (let i = 0; i < numPlayers; ++i)
    {
        // Work out which phase we are in.
        let phase = "";
        const cmpTechnologyManager = QueryPlayerIDInterface(i, IID_TechnologyManager);
        if (cmpTechnologyManager)
        {
            if (cmpTechnologyManager.IsTechnologyResearched("phase_imperial"))
                phase = "imperial";
            else if (cmpTechnologyManager.IsTechnologyResearched("phase_city"))
                phase = "city";
            else if (cmpTechnologyManager.IsTechnologyResearched("phase_town"))
                phase = "town";
            else if (cmpTechnologyManager.IsTechnologyResearched("phase_village"))
                phase = "village";
        }

        const cmpPlayer = QueryPlayerIDInterface(i);
        const cmpPlayerStatisticsTracker = QueryPlayerIDInterface(i, IID_StatisticsTracker);
        const classCounts = cmpTechnologyManager?.GetClassCounts();
        const typeCountsByClass = cmpTechnologyManager?.GetTypeCountsByClass();
        
        // used for researchedTechsCount
        const researchedTechs = new Set(cmpTechnologyManager?.GetResearchedTechs() ?? "null");
        const throwOUT = t => ["civbonuses", "pair", "phase", "soldier_ranged_experience", "unit_advanced", "unit_elephant_african", "unit_elephant_indian", "unit_elite", "upgrade_rank_advanced_mercenary"].every(s => t.indexOf(s) == -1 );
        // used to check if any tech has started
        const startedResearch = Object.keys(this.GetStartedResearch(i));


        ret.players.push({
            "state": cmpPlayer.GetState(),
            "name": cmpPlayer.GetName(),
            "civ": cmpPlayer.GetCiv(),
            "team": cmpPlayer.GetTeam(),
            
            "phase": phase,
            // The tech for phasing up, has different names for each civ e.g. phase_town_athen for ATH, phase_town_generic for MAC, PTO, SEL and SPA, the rest uses phase_town. Same for city phase. This checks if any of the currently researched techs are starting with Phase_town/phase_city
            "phaseTownStarted": startedResearch.some(x => x.startsWith("phase_town")) ?? 0,
            "phaseCityStarted": startedResearch.some(x => x.startsWith("phase_city")) ?? 0,
            
            "researchedTechsCount": researchedTechs.boongui_TechFilter(throwOUT).size,
            "trainingBlocked": cmpPlayer.IsTrainingBlocked(),
            "popCount": cmpPlayer.GetPopulationCount(),
            "popLimit": cmpPlayer.GetPopulationLimit(),
            "classCounts_Support": classCounts?.Support ?? 0,
            "classCounts_Soldier": classCounts?.Soldier ?? 0,
            "classCounts_Siege": classCounts?.Siege ?? 0,
            "classCounts_Infantry": classCounts?.Infantry ?? 0,
            "classCounts_Cavalry": classCounts?.Cavalry ?? 0,
            "classCounts_Champion": classCounts?.Champion ?? 0,
            "classCounts_AfricanElephant": classCounts?.AfricanElephant ?? 0,
            "classCounts_IndianElephant": classCounts?.IndianElephant ?? 0,
            "classCounts_Warship": classCounts?.Warship ?? 0,
                                    
            "resourceCounts": cmpPlayer.GetResourceCounts(),
            
            "enemyUnitsKilledTotal": cmpPlayerStatisticsTracker?.enemyUnitsKilled.total ?? 0,
            "unitsLostTotal": cmpPlayerStatisticsTracker?.unitsLost.total ?? 0,
            
            "hasSharedLos": cmpPlayer.HasSharedLos(),
            "numberAllies": cmpPlayer.GetMutualAllies().length 
        });
    }

    return ret;
};

// Original variable declaration is prefixed with let instead of var so we can't
// just add new entries directly (global let declaration rules)
var boongui_exposedFunctions = {
    "boongui_GetOverlay": 1
};

autociv_patchApplyN(GuiInterface.prototype, "ScriptCall", function (target, that, args)
{
    let [player, name, vargs] = args;
    if (name in boongui_exposedFunctions)
        return that[name](player, vargs);

    return target.apply(that, args);
})

Engine.ReRegisterComponentType(IID_GuiInterface, "GuiInterface", GuiInterface);

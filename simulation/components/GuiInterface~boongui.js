var boongui_excluded_techs = [
    "civbonuses",
    "pair",
    "phase",
    "soldier_ranged_experience",
    "unit_advanced",
    "unit_elephant_african",
    "unit_elephant_indian",
    "unit_elite",
    "upgrade_rank_advanced_mercenary",
];

function splitRatingFromNick(playerName) {
    const result = /^(\S+)\ \((\d+)\)$/g.exec(playerName);
    const nick = (result ? result[1] : playerName).trim();
    const rating = result ? result[2] : "";
    return { nick, rating };
}

/**
 * Opimitzed stats function for boonGUI stats overlay
 */
GuiInterface.prototype.boongui_GetOverlay = function ()
{
    const ret = {
        "players": []
    };

    const cmpPlayerManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_PlayerManager);
    const cmpRangeManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_RangeManager);
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
        const stats = cmpPlayerStatisticsTracker?.GetStatistics();

        let researchedSoldierTechs = 0;
        let researchedGatherTechs = 0;
        let researchedOtherTechs = 0;
        let totalEconomyScore = 0;
        let totalMilitaryScore = 0;
        let totalExplorationScore = 0;
        let totalScore = 0;
    
        if (stats) {
            totalEconomyScore += stats.resourcesGathered['food'];
            totalEconomyScore += stats.resourcesGathered['wood'];
            totalEconomyScore += stats.resourcesGathered['stone'];
            totalEconomyScore += stats.resourcesGathered['metal'];
            totalEconomyScore += stats.tradeIncome;
            totalEconomyScore = Math.round(totalEconomyScore / 10);
            totalMilitaryScore += stats.enemyUnitsKilledValue
            totalMilitaryScore += stats.enemyBuildingsDestroyedValue
            totalMilitaryScore += stats.unitsCapturedValue
            totalMilitaryScore += stats.buildingsCapturedValue
            totalMilitaryScore = Math.round(totalMilitaryScore / 10);
            totalExplorationScore += stats.percentMapExplored;
            totalExplorationScore = totalExplorationScore * 10;
            totalScore = totalEconomyScore + totalMilitaryScore + totalExplorationScore;
        }        

        const researchedTechs = new Set(cmpTechnologyManager?.GetResearchedTechs() ?? "null");

        for (let tech of researchedTechs) {
          if (boongui_excluded_techs.some((s) => tech.includes(s))) continue;
          if (tech.startsWith("soldier_")) researchedSoldierTechs++;
          else if (tech.startsWith("gather_")) researchedGatherTechs++;
          else researchedOtherTechs++;
        }

        const player = splitRatingFromNick(cmpPlayer.GetName());
        const unitTemplatesQueue = [];
        const technologyTemplateQueue = [];

        const totalNumberIdleWorkers = this.FindIdleUnits(i, {
            idleClasses: ["FemaleCitizen", "Trader", "FishingBoat", "Citizen"],
            excludeUnits: [],
        }).length;

        const enemyUnitsKilledTotal = cmpPlayerStatisticsTracker?.enemyUnitsKilled.total ?? 0;
        const unitsLostTotal = cmpPlayerStatisticsTracker?.unitsLost.total ?? 0;
        const killDeathRatio = limitNumber(enemyUnitsKilledTotal / unitsLostTotal);        

        for (let ent of cmpRangeManager.GetEntitiesByPlayer(i)) {
            // let cmpIdentity = Engine.QueryInterface(ent, IID_Identity);
            // let cmpPosition = Engine./QueryInterface(ent, IID_Position);
            let cmpProductionQueue = Engine.QueryInterface(ent, IID_ProductionQueue);
            if (cmpProductionQueue) {
                for (const q of cmpProductionQueue.queue) {
                    if (!q.productionStarted) continue;
                    if (q.unitTemplate) unitTemplatesQueue.push(q)
                    if (q.technologyTemplate && !q.technologyTemplate.startsWith('phase_')) {
                        technologyTemplateQueue.push(q)
                    }
                }
            }
        }

        ret.players.push({
            "state": cmpPlayer.GetState(),
            "name": cmpPlayer.GetName(),
            "nick": player.nick,
            "rating": player.rating,
            "civ": cmpPlayer.GetCiv(),
            "team": cmpPlayer.GetTeam(),
            
            "phase": phase,
            "trainingBlocked": cmpPlayer.IsTrainingBlocked(),
            "popCount": cmpPlayer.GetPopulationCount(),
            "popLimit": cmpPlayer.GetPopulationLimit(),

            "classCounts": classCounts,
            "researchedSoldierTechs": researchedSoldierTechs,
            "researchedGatherTechs": researchedGatherTechs,
            "researchedOtherTechs": researchedOtherTechs,
            "percentMapExplored": stats?.percentMapExplored,
                                    
            "resourceCounts": cmpPlayer.GetResourceCounts(),
            "resourceGatherers": cmpPlayer.GetResourceGatherers(),

            "enemyUnitsKilledTotal": enemyUnitsKilledTotal,
            "unitsLostTotal": unitsLostTotal,
            "killDeathRatio": killDeathRatio,
            
            "startedResearch": this.GetStartedResearch(i),
            "hasSharedLos": cmpPlayer.HasSharedLos(),
            "numberAllies": cmpPlayer.GetMutualAllies().length,

            "unitTemplatesQueue": unitTemplatesQueue,
            "technologyTemplateQueue": technologyTemplateQueue,

            "totalNumberIdleWorkers": totalNumberIdleWorkers,
            
            "totalEconomyScore": totalEconomyScore,
            "totalMilitaryScore": totalMilitaryScore,
            "totalExplorationScore": totalExplorationScore,
            "totalScore": totalScore,
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

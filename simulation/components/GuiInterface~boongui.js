const boongui_excluded_techs = [
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

const boongui_template_keys = {
    "structures/palisades_tower": "structures/palisades_tower",
    "structures/palisades_medium": "structures/palisades_tower",
    "structures/palisades_long": "structures/palisades_tower",
    "structures/palisades_gate": "structures/palisades_tower",
};

function splitRatingFromNick(playerName) {
    const result = /^(\S+)\ \((\d+)\)$/g.exec(playerName);
    const nick = (result ? result[1] : playerName).trim();
    const rating = result ? result[2] : "";
    return { nick, rating };
}

function limitNumber(num) {
    return num < 10 ? Number(num.toFixed(1)) : Math.round(num);
}

/**
 * Opimitzed stats function for boonGUI stats overlay
 */
GuiInterface.prototype.boongui_GetOverlay = function () {
    const ret = {
        "players": []
    };

    const cmpPlayerManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_PlayerManager);
    const cmpRangeManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_RangeManager);
    const cmpTemplateManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_TemplateManager);
    const numPlayers = cmpPlayerManager.GetNumPlayers();

    for (let i = 0; i < numPlayers; ++i) {
        // Work out which phase we are in.
        let phase = "";
        const cmpTechnologyManager = QueryPlayerIDInterface(i, IID_TechnologyManager);
        if (cmpTechnologyManager) {
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

        let militaryTechs = 0;
        let economyTechs = 0;
        let totalEconomyScore = 0;
        let totalMilitaryScore = 0;
        let totalExplorationScore = 0;
        let totalScore = 0;

        const resTypes = ['food', 'wood', 'stone', 'metal'];
        if (stats) {
            for (const resType of resTypes) {
                totalEconomyScore += stats.resourcesGathered[resType];
            }
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

        const queueMap = new Map();

        function addToQueue({ mode, templateType, entity, template, count, progress }) {
            template = boongui_template_keys[template] ?? template;
            // remove rank
            template = template
                .replace(/_[ae]$/, '_b')
                .replace(/^(units\/.+)_house$/, '$1');

            const key = `${mode}:${template}`;
            let obj = queueMap.get(key);
            if (obj) {
                obj.count += count;
                obj.progress += progress;
                if (entity != null) obj.entity.push(entity);
            } else {
                queueMap.set(key, {
                    mode,
                    count,
                    template,
                    progress,
                    entity: entity != null ? [entity] : [],
                    templateType
                });
            }
        }

        const researchedTechs = new Set(cmpTechnologyManager?.GetResearchedTechs() ?? []);
        for (let template of researchedTechs) {
            if (boongui_excluded_techs.some((s) => template.includes(s))) continue;
            let mode;

            if (template.startsWith("soldier_")) {
                militaryTechs++;
                mode = "Military Technologies";
            } else if (template.startsWith("gather_")) {
                economyTechs++;
                mode = "Economy Technologies";
            } else {
                mode = "Other Technologies";
            }

            addToQueue({ mode, count: 1, template, progress: 1, entity: null, templateType: "technology" });
        }

        const player = splitRatingFromNick(cmpPlayer.GetName());
        const civ = cmpPlayer.GetCiv();

        const totalNumberIdleWorkers = this.FindIdleUnits(i, {
            idleClasses: ["FemaleCitizen", "Trader", "FishingBoat", "Citizen"],
            excludeUnits: [],
        }).length;

        const enemyUnitsKilledTotal = cmpPlayerStatisticsTracker?.enemyUnitsKilled.total ?? 0;
        const unitsLostTotal = cmpPlayerStatisticsTracker?.unitsLost.total ?? 0;
        const killDeathRatio = limitNumber(enemyUnitsKilledTotal / unitsLostTotal);

        const civCentres = [];

        for (let entity of cmpRangeManager.GetEntitiesByPlayer(i)) {
            let cmpIdentity = Engine.QueryInterface(entity, IID_Identity);
            let cmpProductionQueue = Engine.QueryInterface(entity, IID_ProductionQueue);

            let classes = new Set(cmpIdentity?.classesList ?? [])
            if (classes.has('CivCentre') && !classes.has('Foundation')) {
                civCentres.push(entity);
            }

            if (classes.has('Structure') && !classes.has('Foundation')) {
                const template = cmpTemplateManager.GetCurrentTemplateName(entity)
                const mode = "Buildings";
                const templateType = 'unit';
                addToQueue({ mode, templateType, entity, template, count: 1, progress: 0 });
            }

            if (classes.has('Unit') && !classes.has('Relic') && !classes.has('Hero')) {
                const template = cmpTemplateManager.GetCurrentTemplateName(entity)
                const mode = "Units";
                const templateType = 'unit';
                addToQueue({ mode, templateType, entity, template, count: 1, progress: 0 });
            }

            if (cmpProductionQueue) {
                for (const q of cmpProductionQueue.queue) {
                    if (!q.productionStarted) continue;
                    const { count, timeRemaining, timeTotal } = q;
                    const progress = (timeRemaining / timeTotal);

                    if (q.unitTemplate) {
                        const template = q.unitTemplate;
                        const mode = "Production";
                        const templateType = "unit";
                        addToQueue({ mode, templateType, entity, template, count, progress });
                    }

                    if (q.technologyTemplate) {
                        const mode = "Production";
                        const templateType = "technology";
                        const template = q.technologyTemplate;
                        addToQueue({ mode, templateType, entity, template, count, progress });
                    }
                }
            }

            let cmpFoundation = Engine.QueryInterface(entity, IID_Foundation);
            if (cmpFoundation) {
                let { hitpoints, maxHitpoints } = Engine.QueryInterface(entity, IID_Health);
                const mode = "Production";
                const templateType = "unit";
                const count = 1;
                const template = cmpFoundation.finalTemplateName;
                const progress = 1 - (hitpoints / maxHitpoints);
                addToQueue({ mode, templateType, entity, template, count, progress });
            }
        }

        const queue = Array.from(queueMap.values())

        ret.players.push({
            "state": cmpPlayer.GetState(),
            "name": cmpPlayer.GetName(),
            "nick": player.nick,
            "rating": player.rating,
            "civ": civ,
            "team": cmpPlayer.GetTeam(),

            "phase": phase,
            "trainingBlocked": cmpPlayer.IsTrainingBlocked(),
            "popCount": cmpPlayer.GetPopulationCount(),
            "popLimit": cmpPlayer.GetPopulationLimit(),

            "classCounts": classCounts,
            "militaryTechs": militaryTechs,
            "economyTechs": economyTechs,
            "percentMapExplored": stats?.percentMapExplored,

            "resourceCounts": cmpPlayer.GetResourceCounts(),
            "resourceGatherers": cmpPlayer.GetResourceGatherers(),

            "enemyUnitsKilledTotal": enemyUnitsKilledTotal,
            "unitsLostTotal": unitsLostTotal,
            "killDeathRatio": killDeathRatio,

            "startedResearch": this.GetStartedResearch(i),
            "hasSharedLos": cmpPlayer.HasSharedLos(),
            "numberAllies": cmpPlayer.GetMutualAllies().length,

            "totalNumberIdleWorkers": totalNumberIdleWorkers,

            "totalEconomyScore": totalEconomyScore,
            "totalMilitaryScore": totalMilitaryScore,
            "totalExplorationScore": totalExplorationScore,
            "totalScore": totalScore,

            "queue": queue,
            "civCentres": civCentres
        });
    }

    return ret;
};

// Original variable declaration is prefixed with let instead of var so we can't
// just add new entries directly (global let declaration rules)
var boongui_exposedFunctions = {
    "boongui_GetOverlay": 1
};

autociv_patchApplyN(GuiInterface.prototype, "ScriptCall", function (target, that, args) {
    let [player, name, vargs] = args;
    if (name in boongui_exposedFunctions)
        return that[name](player, vargs);

    return target.apply(that, args);
})

Engine.ReRegisterComponentType(IID_GuiInterface, "GuiInterface", GuiInterface);

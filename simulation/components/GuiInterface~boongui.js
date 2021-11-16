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

const boongui_resources_techs = {
    food: [
        "gather_wicker_baskets",
        "gather_farming_plows",
        "gather_farming_harvester",
        "gather_farming_training",
        "gather_farming_fertilizer",
        "gather_animals_stockbreeding",
        "gather_capacity_basket",
        "gather_capacity_carts",
    ],
    wood: [
        "gather_lumbering_ironaxes",
        "gather_lumbering_sharpaxes",
        "gather_lumbering_strongeraxes",
        "gather_capacity_basket",
        "gather_capacity_carts",
    ],
    stone: [
        "gather_mining_servants",
        "gather_mining_serfs",
        "gather_mining_slaves",
        "gather_capacity_basket",
        "gather_capacity_carts",
    ],
    metal: [
        "gather_mining_wedgemallet",
        "gather_mining_shaftmining",
        "gather_mining_silvermining",
        "gather_capacity_basket",
        "gather_capacity_carts",
    ],
};

const boongui_phases = ['imperial', 'city', 'town', 'village'];

const boongui_building_types = [{
    mode: 'civic_buildings', classes: ["Civic", "Dock"],
},{
    mode: 'economic_buildings', classes: ["Economic", "Resource"]
},{ 
    mode: 'military_buildings', classes: ["Military", "Syssiton"],
},{
    mode: 'defensive_buildings', classes: ["Defensive", "Palisade", "Wall"]
}];

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
        const cmpTechnologyManager = QueryPlayerIDInterface(i, IID_TechnologyManager);
        // Work out which phase we are in.
        let phase = "";
        if (cmpTechnologyManager) {
            for (const _phase of boongui_phases) {
                if (cmpTechnologyManager.IsTechnologyResearched(`phase_${_phase}`)) {
                    phase = _phase;
                    break;
                }
            }
        }

        const cmpPlayer = QueryPlayerIDInterface(i);
        const cmpPlayerStatisticsTracker = QueryPlayerIDInterface(i, IID_StatisticsTracker);
        const classCounts = cmpTechnologyManager?.GetClassCounts();
        const stats = cmpPlayerStatisticsTracker?.GetStatistics();

        let militaryTechsCount = 0;
        let economyTechsCount = 0;
        let totalEconomyScore = 0;
        let totalMilitaryScore = 0;
        let totalExplorationScore = 0;
        let totalScore = 0;

        const resTypes = Object.keys(boongui_resources_techs)
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

        const resourcesTechs = {}
        const militaryTechs = [];

        for (const resType of resTypes) {
            resourcesTechs[resType] = boongui_resources_techs[resType].filter(tech => 
                cmpTechnologyManager?.IsTechnologyResearched(tech)
            );
        }

        const researchedTechs = new Set(cmpTechnologyManager?.GetResearchedTechs() ?? []);
        for (let template of researchedTechs) {
            if (boongui_excluded_techs.some((s) => template.includes(s))) continue;
            let mode;

            if (template.startsWith("soldier_")) {
                militaryTechsCount++;
                militaryTechs.push(template);
                mode = "military_technologies";
            } else if (template.startsWith("gather_")) {
                economyTechsCount++;
                mode = "economy_technologies";
            } else {
                mode = "other_Technologies";
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
                let mode = boongui_building_types[0].mode;
                for (const type of boongui_building_types) {
                    if (type.classes.some(c => classes.has(c))) {
                        mode = type.mode;
                        break;
                    }
                }
                const templateType = 'unit';
                addToQueue({ mode, templateType, entity, template, count: 1, progress: 0 });
            }

            if (classes.has('Unit') && !classes.has('Relic') && !classes.has('Hero')) {
                const template = cmpTemplateManager.GetCurrentTemplateName(entity)
                const mode = "units";
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
                        const mode = "production";
                        const templateType = "unit";
                        addToQueue({ mode, templateType, entity, template, count, progress });
                    }

                    if (q.technologyTemplate) {
                        const mode = "production";
                        const templateType = "technology";
                        const template = q.technologyTemplate;
                        addToQueue({ mode, templateType, entity, template, count, progress });
                    }
                }
            }

            let cmpFoundation = Engine.QueryInterface(entity, IID_Foundation);
            if (cmpFoundation) {
                let { hitpoints, maxHitpoints } = Engine.QueryInterface(entity, IID_Health);
                const mode = "production";
                const templateType = "unit";
                const count = 1;
                const template = cmpFoundation.finalTemplateName;
                const progress = 1 - (hitpoints / maxHitpoints);
                addToQueue({ mode, templateType, entity, template, count, progress });
            }
        }

        const numberAllies = cmpPlayer.GetMutualAllies().filter(
            player => QueryPlayerIDInterface(player).GetState() == "active"
        ).length;

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
            "militaryTechsCount": militaryTechsCount,
            "economyTechsCount": economyTechsCount,
            "percentMapExplored": stats?.percentMapExplored,

            "resourceCounts": cmpPlayer.GetResourceCounts(),
            "resourceGatherers": cmpPlayer.GetResourceGatherers(),
            "resourcesGathered": stats ? stats.resourcesGathered : null,
            "resourcesTechs": resourcesTechs,

            "enemyUnitsKilledTotal": enemyUnitsKilledTotal,
            "unitsLostTotal": unitsLostTotal,
            "killDeathRatio": killDeathRatio,

            "startedResearch": this.GetStartedResearch(i),
            "hasSharedLos": cmpPlayer.HasSharedLos(),
            "numberAllies": numberAllies,

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

GuiInterface.prototype.DisplayRallyPoint = function(player, cmd)
{
    if (cmd.skip && this.ChangedRallyPoints.size == 0) return;
    let cmpPlayer = QueryPlayerIDInterface(player);

    // If there are some rally points already displayed, first hide them.
    for (let ent of this.entsRallyPointsDisplayed)
    {
        let cmpRallyPointRenderer = Engine.QueryInterface(ent, IID_RallyPointRenderer);
        if (cmpRallyPointRenderer)
            cmpRallyPointRenderer.SetDisplayed(false);
    }

    this.entsRallyPointsDisplayed = [];

    // Show the rally points for the passed entities.
    for (let ent of cmd.entities)
    {
        let cmpRallyPointRenderer = Engine.QueryInterface(ent, IID_RallyPointRenderer);
        if (!cmpRallyPointRenderer)
            continue;

        // Entity must have a rally point component to display a rally point marker
        // (regardless of whether cmd specifies a custom location).
        let cmpRallyPoint = Engine.QueryInterface(ent, IID_RallyPoint);
        if (!cmpRallyPoint)
            continue;

        let cmpOwnership = Engine.QueryInterface(ent, IID_Ownership);

        // Rally point should be displayed if one of the following is true:
        // 1) It is owned by the player
        // 2) The player is an observer
        // 3) The player is a a mutual ally with shared LOS

        if (cmpPlayer && cmpOwnership) {
            const owner = cmpOwnership.GetOwner();
            if (owner != player) {
                if (!cmpPlayer.IsMutualAlly(owner) || !cmpPlayer.HasSharedLos()) {
                    continue;
                }
            }
        }

        // If the command was passed an explicit position, use that and
        // override the real rally point position; otherwise use the real position.
        let pos;
        if (cmd.x && cmd.z)
            pos = cmd;
        else
            // May return undefined if no rally point is set.
            pos = cmpRallyPoint.GetPositions()[0];

        if (pos)
        {
            // Only update the position if we changed it (cmd.queued is set).
            // Note that Add-/SetPosition take a CFixedVector2D which has X/Y components, not X/Z.
            if ("queued" in cmd)
            {
                if (cmd.queued == true)
                    cmpRallyPointRenderer.AddPosition(new Vector2D(pos.x, pos.z));
                else
                    cmpRallyPointRenderer.SetPosition(new Vector2D(pos.x, pos.z));

                this.LocalRallyPoints.add(ent);
            }
            else if (!cmpRallyPointRenderer.IsSet()) {
                // Rebuild the renderer when not set (when reading saved game or in case of building update).
                for (let posi of cmpRallyPoint.GetPositions())
                    cmpRallyPointRenderer.AddPosition(new Vector2D(posi.x, posi.z));
            } else if (!this.LocalRallyPoints.has(ent) && this.ChangedRallyPoints.has(ent)) {
                cmpRallyPointRenderer.SetPosition(new Vector2D(pos.x, pos.z));
                for (let posi of cmpRallyPoint.GetPositions())
                    cmpRallyPointRenderer.AddPosition(new Vector2D(posi.x, posi.z));
            }

            cmpRallyPointRenderer.SetDisplayed(true);

            // Remember which entities have their rally points displayed so we can hide them again.
            this.entsRallyPointsDisplayed.push(ent);
        }

        this.ChangedRallyPoints.clear();
    }
};

// Original variable declaration is prefixed with let instead of var so we can't
// just add new entries directly (global let declaration rules)
var boongui_exposedFunctions = {
    "boongui_GetOverlay": 1,
    "DisplayRallyPoint": 1
};

GuiInterface.prototype.LocalRallyPoints = new Set();
GuiInterface.prototype.ChangedRallyPoints = new Set();

autociv_patchApplyN(GuiInterface.prototype, "ScriptCall", function (target, that, args) {
    let [player, name, vargs] = args;
    if (name in boongui_exposedFunctions)
        return that[name](player, vargs);

    return target.apply(that, args);
})

Engine.ReRegisterComponentType(IID_GuiInterface, "GuiInterface", GuiInterface);

const boongui_excluded_techs = [
	"civbonuses",
	"pair",
	"phase",
	"soldier_ranged_experience",
	"unit_advanced",
	"unit_elephant_african",
	"unit_elephant_indian",
	"unit_elite",
	"upgrade_rank_advanced_mercenary"
];

const boongui_template_keys = {
	"structures/palisades_tower": "structures/palisades_tower",
	"structures/palisades_medium": "structures/palisades_tower",
	"structures/palisades_long": "structures/palisades_tower",
	"structures/palisades_gate": "structures/palisades_tower"
};

const boongui_more_military_techs = [
	"archer_attack_spread",
	"archery_tradition",
	"attack_soldiers_will"
];

const boongui_resources_techs = {
	"food": [
		"gather_wicker_baskets",
		"gather_farming_plows",
		"gather_farming_seed_drill",
		"gather_farming_water_weeding",
		"gather_farming_chain_pump",
		"gather_farming_harvester",
		"gather_farming_training",
		"gather_farming_fertilizer",
		"gather_animals_stockbreeding",
		"gather_capacity_basket",
		"gather_capacity_wheelbarrow",
		"gather_capacity_carts"
	],
	"wood": [
		"gather_lumbering_ironaxes",
		"gather_lumbering_sharpaxes",
		"gather_lumbering_strongeraxes",
		"gather_capacity_basket",
		"gather_capacity_wheelbarrow",
		"gather_capacity_carts"
	],
	"stone": [
		"gather_mining_servants",
		"gather_mining_serfs",
		"gather_mining_slaves",
		"gather_capacity_basket",
		"gather_capacity_wheelbarrow",
		"gather_capacity_carts"
	],
	"metal": [
		"gather_mining_wedgemallet",
		"gather_mining_shaftmining",
		"gather_mining_silvermining",
		"gather_capacity_basket",
		"gather_capacity_wheelbarrow",
		"gather_capacity_carts"
	]
};

const boongui_resources_types = Object.keys(boongui_resources_techs);

const boongui_phases = ["imperial", "city", "town", "village"];

const boongui_building_types = [
	{ "mode": "civic_buildings", "classes": ["Civic", "Dock"] },
	{ "mode": "economic_buildings", "classes": ["Economic", "Resource"] },
	{ "mode": "military_buildings", "classes": ["Military", "Syssiton", "Council", "Gymnasium"] },
	{ "mode": "defensive_buildings", "classes": ["Defensive", "Palisade", "Wall"] }
];

function splitRatingFromNick(playerName)
{
	const result = /^(\S+)\ \((\d+)\)$/g.exec(playerName);
	const nick = (result ? result[1] : playerName).trim();
	const rating = result ? result[2] : "";
	return { nick, rating };
}

class CustomQueue extends Map {
	static RegexRank = /_[ae]$/;
	static RegexHouse = /^(units\/.+)_house$/;
	static RegexStructures = /^(structures\/)(.+\/)/;

	add({ mode, templateType, entity, template, count, progress, classesList }) {
		template = boongui_template_keys[template] ?? template;
		template = template
			.replace(CustomQueue.RegexRank, "_b")
			.replace(CustomQueue.RegexHouse, "$1");
		const key = `${mode}:${template.replace(CustomQueue.RegexStructures, "$1")}`;

		const obj = this.get(key);
		if (obj)
		{
			obj.count += count;
			obj.progress += progress;
			if (entity != null) obj.entity.push(entity);
		}
		else
		{
			this.set(key, {
				mode,
				count,
				template,
				progress,
				"entity": entity != null ? [entity] : [],
				templateType,
				classesList
			});
		}
	}

	toArray() {
		return Array.from(this.values());
	}
}

const boongui_players_weakmap = new WeakMap();
const boongui_fullupdate_interval = 1200;
let boongui_fullupdate_last = 0;

/**
 * Opimitzed stats function for boonGUI stats overlay
 */
GuiInterface.prototype.boongui_GetOverlay = function(_, { g_IsObserver, g_ViewedPlayer, g_LastTickTime }) {
	const ret = {
		"players": []
	};

	let isFullUpdate = false;
	if (g_LastTickTime - boongui_fullupdate_last >= boongui_fullupdate_interval)
	{
		isFullUpdate = true;
		boongui_fullupdate_last = g_LastTickTime;
	}

	const cmpPlayerManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_PlayerManager);
	const cmpRangeManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_RangeManager);
	const cmpTemplateManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_TemplateManager);
	const numPlayers = cmpPlayerManager.GetNumPlayers();

	const cmpPlayers = [];
	for (let index = 0; index < numPlayers; ++index)
	{
		const playerEnt = cmpPlayerManager.GetPlayerByID(index);
		const cmpPlayer = QueryPlayerIDInterface(index);
		const cmpIdentity = Engine.QueryInterface(playerEnt, IID_Identity);
		const state = cmpPlayer.GetState();
		const hasSharedLos = cmpPlayer.HasSharedLos();
		cmpPlayers.push({ index, state, hasSharedLos, cmpPlayer, cmpIdentity });
	}

	const cmpPlayerViewed = cmpPlayers[g_ViewedPlayer];
	ret.players = cmpPlayers.filter(({ index, state, cmpPlayer }) => {
		if (index === 0)
			return false; // Gaia index 0
		if (state == "defeated" && index != g_ViewedPlayer)
			return false;
		if (!cmpPlayerViewed || index == g_ViewedPlayer)
			return true;
		if (!cmpPlayerViewed.hasSharedLos || !cmpPlayer.IsMutualAlly(cmpPlayerViewed.index))
			return false;
		return true;
	}).map(({ index, cmpPlayer, cmpIdentity, state, hasSharedLos }) => {
		const cmpTechnologyManager = QueryPlayerIDInterface(index, IID_TechnologyManager);
		const cmpPlayerStatisticsTracker = QueryPlayerIDInterface(index, IID_StatisticsTracker);

		const player = {
			index,
			state,
			hasSharedLos,

			// @cmpPlayer
			"name": cmpIdentity.GetName(),
			"civ": cmpIdentity.GetCiv(),
			"team": cmpPlayer.GetTeam(),
			"trainingBlocked": cmpPlayer.IsTrainingBlocked(),
			"popCount": cmpPlayer.GetPopulationCount(),
			"popLimit": cmpPlayer.GetPopulationLimit(),
			"popMax": cmpPlayer.GetMaxPopulation(),
			"resourceCounts": cmpPlayer.GetResourceCounts(),
			"resourceGatherers": cmpPlayer.GetResourceGatherers(),

			// @cmpTechnologyManager
			"classCounts": cmpTechnologyManager?.GetClassCounts() ?? {}
		};

		let cached = boongui_players_weakmap.get(cmpPlayer);
		let updateCache = isFullUpdate;

		if (!cached)
		{
			cached = {};
			updateCache = true;
			boongui_players_weakmap.set(cmpPlayer, cached);
		}

		if (updateCache)
		{
			cached.civCentres = [];
			cached.queue = new CustomQueue();
			// cached.percentMapExplored = cmpPlayerStatisticsTracker?.GetPercentMapExplored() ?? 0;
			// cached.totalEconomyScore = 0;
			// cached.totalMilitaryScore = 0;
			// cached.totalExplorationScore = 0;
			// cached.totalScore = 0;
			cached.resourcesGathered = cmpPlayerStatisticsTracker?.resourcesGathered || {};
			cached.enemyUnitsKilledTotal = cmpPlayerStatisticsTracker?.enemyUnitsKilled.total ?? 0;
			cached.unitsLostTotal = cmpPlayerStatisticsTracker?.unitsLost.total ?? 0;
		}

		// (1) Get Nickname and Rating
		const { nick, rating } = splitRatingFromNick(player.name);
		player.nick = nick;
		player.rating = rating;

		// (2) Get Phase
		let phase = "";
		if (cmpTechnologyManager)
		{
			for (const _phase of boongui_phases)
			{
				if (cmpTechnologyManager.IsTechnologyResearched(`phase_${_phase}`))
				{
					phase = _phase;
					break;
				}
			}
		}
		player.phase = phase;

		// (3) Get Statistics
		// if (updateCache)
		// {
		// 	if (cmpPlayerStatisticsTracker)
		// 	{
		// 		for (const resType of boongui_resources_types)
		// 		{
		// 			cached.totalEconomyScore += cached.resourcesGathered[resType];
		// 		}
		// 		cached.totalEconomyScore += cmpPlayerStatisticsTracker.tradeIncome;
		// 		cached.totalEconomyScore = Math.round(cached.totalEconomyScore / 10);
		// 		cached.totalMilitaryScore += cmpPlayerStatisticsTracker.enemyUnitsKilledValue;
		// 		cached.totalMilitaryScore += cmpPlayerStatisticsTracker.enemyBuildingsDestroyedValue;
		// 		cached.totalMilitaryScore += cmpPlayerStatisticsTracker.unitsCapturedValue;
		// 		cached.totalMilitaryScore += cmpPlayerStatisticsTracker.buildingsCapturedValue;
		// 		cached.totalMilitaryScore = Math.round(cached.totalMilitaryScore / 10);
		// 		cached.totalExplorationScore += cached.percentMapExplored;
		// 		cached.totalExplorationScore *= 10;
		// 		cached.totalScore = cached.totalEconomyScore + cached.totalMilitaryScore + cached.totalExplorationScore;
		// 	}
		// }

		// player.percentMapExplored = cached.percentMapExplored;
		// player.totalEconomyScore = cached.totalEconomyScore;
		// player.totalMilitaryScore = cached.totalMilitaryScore;
		// player.totalExplorationScore = cached.totalExplorationScore;
		// player.totalScore = cached.totalScore;
		player.resourcesGathered = cached.resourcesGathered;
		player.enemyUnitsKilledTotal = cached.enemyUnitsKilledTotal;
		player.unitsLostTotal = cached.unitsLostTotal;
		player.killDeathRatio = cached.enemyUnitsKilledTotal / cached.unitsLostTotal;

		// (5) Get Number of allies
		player.numberAllies = cmpPlayer.GetMutualAllies().filter(playerNumber => cmpPlayers[playerNumber].state != "defeated").length;

		// (6) Get Researched technologies set
		player.researchedTechs = new Set(cmpTechnologyManager?.GetResearchedTechs() ?? []);

		// (7) Get StartedResearch technologies
		player.startedResearch = this.GetStartedResearch(index);

		// (8) Get Resources related technologies
		const resourcesTechs = {};
		for (const resType of boongui_resources_types)
		{
			resourcesTechs[resType] = boongui_resources_techs[resType].filter(tech =>
				cmpTechnologyManager?.IsTechnologyResearched(tech)
			);
		}
		player.resourcesTechs = resourcesTechs;

		// (9) Get Military and economy related technologies
		const militaryTechs = [];
		let militaryTechsCount = 0;
		let economyTechsCount = 0;
		for (const template of player.researchedTechs)
		{
			if (boongui_excluded_techs.some(s => template.includes(s))) continue;
			let mode;
			if (template.startsWith("soldier_") || boongui_more_military_techs.includes(template))
			{
				militaryTechsCount++;
				militaryTechs.push(template);
				mode = "military_technologies";
			}
			else if (template.startsWith("gather_"))
			{
				economyTechsCount++;
				mode = "economy_technologies";
			}
			else
			{
				mode = "other_technologies";
			}

			if (updateCache)
			{
				cached.queue.add({ mode, "count": 1, template, "progress": 1, "entity": null, "templateType": "technology", "classesList": null });
			}
		}

		player.militaryTechsCount = militaryTechsCount;
		player.economyTechsCount = economyTechsCount;
		player.militaryTechs = militaryTechs;

		// (10) Get all entities
		if (updateCache)
		{
			for (const entity of cmpRangeManager.GetEntitiesByPlayer(index))
			{
				const cmpProductionQueue = Engine.QueryInterface(entity, IID_ProductionQueue);
				const classesList = Engine.QueryInterface(entity, IID_Identity)?.classesList;
				if (classesList && !classesList.includes("Foundation"))
				{
					if (classesList.includes("CivCentre"))
					{
						cached.civCentres.push(entity);
					}

					if (classesList.includes("Structure"))
					{
						const template = cmpTemplateManager.GetCurrentTemplateName(entity);

						let mode = boongui_building_types[0].mode;
						for (const type of boongui_building_types)
						{
							if (type.classes.some(c => classesList.includes(c)))
							{
								mode = type.mode;
								break;
							}
						}
						const templateType = "unit";
						cached.queue.add({ mode, templateType, entity, template, "count": 1, "progress": 0, "classesList": null });
					}

					if (classesList.includes("Unit") &&
                        !classesList.includes("Relic") &&
                        !classesList.includes("Hero") &&
                        !classesList.includes("Domestic"))
					{
						const template = cmpTemplateManager.GetCurrentTemplateName(entity);
						const mode = "units";
						const templateType = "unit";
						cached.queue.add({ mode, templateType, entity, template, "count": 1, "progress": 0, "classesList": null });
					}
				}

				const cmpUnitAI = Engine.QueryInterface(entity, IID_UnitAI);
				if (cmpUnitAI && cmpUnitAI.isIdle && !cmpUnitAI.isGarrisoned)
				{
					const cmpTurretable = Engine.QueryInterface(entity, IID_Turretable);
					if (cmpTurretable && cmpTurretable.IsEjectable())
						continue;
					//  keep in sync with g_boonGUI_WorkerTypes
					if ((classesList.includes("FemaleCitizen") ||
						classesList.includes("Trader") ||
						classesList.includes("FishingBoat") ||
						classesList.includes("CitizenSoldier")) &&
						!classesList.includes("Mercenary"))
					{
						const template = cmpTemplateManager.GetCurrentTemplateName(entity);
						const mode = "idle";
						const templateType = "unit";
						cached.queue.add({ mode, templateType, entity, template, "count": 1, "progress": 0, classesList });
					}
				}

				if (cmpProductionQueue)
				{
					for (const queue of cmpProductionQueue.queue)
					{
						if (!queue.started || queue.paused) continue;
						const cmpTrainer = Engine.QueryInterface(queue.producer, IID_Trainer);
						const cmpResearcher = Engine.QueryInterface(queue.producer, IID_Researcher);
						const mode = "production";
						if (queue.entity)
						{
							const { count, "progress": reverseProgress, "unitTemplate": template, neededSlots } = cmpTrainer.GetBatch(queue.entity);
							//  Limit units to actual production and not list training of an unit that is blocked.
							if (neededSlots > 0) continue;
							const progress = 1 - reverseProgress;
							const templateType = "unit";
							cached.queue.add({ mode, templateType, entity, template, count, progress, "classesList": null });
						}

						if (queue.technology)
						{
							const { "progress": reverseProgress, "templateName": template } = cmpResearcher.GetResearchingTechnology(queue.technology);
							const progress = 1 - reverseProgress;
							const templateType = "technology";
							const count = 1;
							cached.queue.add({ mode, templateType, entity, template, count, progress, "classesList": null });
						}
					}
				}

				const cmpFoundation = Engine.QueryInterface(entity, IID_Foundation);
				if (cmpFoundation)
				{
					const { hitpoints, maxHitpoints } = Engine.QueryInterface(entity, IID_Health);
					const mode = "production";
					const templateType = "unit";
					const count = 1;
					const template = cmpFoundation.finalTemplateName;
					const progress = 1 - (hitpoints / maxHitpoints);
					cached.queue.add({ mode, templateType, entity, template, count, progress, "classesList": null });
				}
			}
		}

		player.civCentres = cached.civCentres;
		player.queue = cached.queue.toArray();

		return player;
	});

	// If the view is set to the player, the line moves to the top.
	if (cmpPlayers[g_ViewedPlayer])
	{
		const sortedViewedPlayerAtTop = function(a, b) {
			if ((a.name === cmpPlayerViewed.cmpIdentity.name) != (b.name === cmpPlayerViewed.cmpIdentity.name))
				return a.name === cmpPlayerViewed.cmpIdentity.name ? -1 : 1;
			return a.team - b.team;
		};
		ret.players.sort(sortedViewedPlayerAtTop);
	}
	ret.players.sort((a, b) => a.team - b.team);
	return ret;
};

GuiInterface.prototype.DisplayRallyPoint = function(player, cmd) {
	// if selection did not change (cmd.watch == true)
	// Limit updates to remote rally points

	if (cmd.watch && this.ChangedRallyPoints.size == 0) return;
	if (!cmd.watch) this.LocalRallyPoints.clear();

	const cmpPlayer = QueryPlayerIDInterface(player);

	// If there are some rally points already displayed, first hide them.
	for (const ent of this.entsRallyPointsDisplayed)
	{
		const cmpRallyPointRenderer = Engine.QueryInterface(ent, IID_RallyPointRenderer);
		if (cmpRallyPointRenderer)
			cmpRallyPointRenderer.SetDisplayed(false);
	}

	this.entsRallyPointsDisplayed = [];

	// Show the rally points for the passed entities.
	for (const ent of cmd.entities)
	{
		const cmpRallyPointRenderer = Engine.QueryInterface(ent, IID_RallyPointRenderer);
		if (!cmpRallyPointRenderer)
			continue;

		// Entity must have a rally point component to display a rally point marker
		// (regardless of whether cmd specifies a custom location).
		const cmpRallyPoint = Engine.QueryInterface(ent, IID_RallyPoint);
		if (!cmpRallyPoint)
			continue;

		const cmpOwnership = Engine.QueryInterface(ent, IID_Ownership);

		// Rally point should be displayed if one of the following is true:
		// 1) It is owned by the player
		// 2) The player is an observer
		// 3) The player is a mutual ally with shared LOS

		if (cmpPlayer && cmpOwnership)
		{
			const owner = cmpOwnership.GetOwner();
			if (owner != player)
			{
				if (!cmpPlayer.IsMutualAlly(owner) || !cmpPlayer.HasSharedLos())
				{
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
			// Update position on changes (cmd.queued is set).
			// Note that Add-/SetPosition take a CFixedVector2D which has X/Y components, not X/Z.
			if ("queued" in cmd)
			{
				if (cmd.queued == true)
					cmpRallyPointRenderer.AddPosition(new Vector2D(pos.x, pos.z));
				else
					cmpRallyPointRenderer.SetPosition(new Vector2D(pos.x, pos.z));

				this.LocalRallyPoints.add(ent);
			}
			else if (!cmpRallyPointRenderer.IsSet())
			{
				// Rebuild the renderer when not set (when reading saved game or in case of building update).
				for (const posi of cmpRallyPoint.GetPositions())
					cmpRallyPointRenderer.AddPosition(new Vector2D(posi.x, posi.z));
			}
			else if (!this.LocalRallyPoints.has(ent) && this.ChangedRallyPoints.has(ent))
			{
				cmpRallyPointRenderer.SetPosition(new Vector2D(pos.x, pos.z));
				for (const posi of cmpRallyPoint.GetPositions())
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

autociv_patchApplyN(GuiInterface.prototype, "ScriptCall", function(target, that, args) {
	const [player, name, vargs] = args;
	if (name in boongui_exposedFunctions)
		return that[name](player, vargs);

	return target.apply(that, args);
});


Engine.ReRegisterComponentType(IID_GuiInterface, "GuiInterface", GuiInterface);
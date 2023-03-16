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
                        !classesList.includes("Domestic"))
					{
						const template = cmpTemplateManager.GetCurrentTemplateName(entity);
						const mode = "units";
						const templateType = "unit";
						cached.queue.add({ mode, templateType, entity, template, "count": 1, "progress": 0, "classesList": null });
					}
				}

				const cmpUnitAI = Engine.QueryInterface(entity, IID_UnitAI);
				if (cmpUnitAI?.isIdle && !cmpUnitAI.isGarrisoned)
				{
					const cmpTurretable = Engine.QueryInterface(entity, IID_Turretable);
					if (cmpTurretable?.IsEjectable())
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
				if (cmpFoundation?.committed)
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

/**
 * Highlight a targeted entity.
 */
GuiInterface.prototype.HoverSelectionHighlight = function(player, cmd)
{
	for (const ent of cmd.entities)
	{
		const cmpVisual = Engine.QueryInterface(ent, IID_Visual);
		if (!cmpVisual) return;
		let shade = 1;
		if (cmd.enabled && cmd.validAction)
		{
			shade = Engine.QueryInterface(SYSTEM_ENTITY, IID_RangeManager).GetLosVisibility(ent, player) === "visible" ? 1.4 : 2.2;
			cmpVisual.SetShadingColor(...Array(3).fill(shade), 1);
		}
		else
			cmpVisual.SetShadingColor(...Array(4).fill(shade));
	}
};

// --------------------------------------------------------------------------------
// "SetBuildingPlacementPreview" and "SetWallPlacementPreview" are included here only to get the green color for "SetShadingColor".
// --------------------------------------------------------------------------------

GuiInterface.prototype.SetBuildingPlacementPreview = function(player, cmd)
{
	let result = {
		"success": false,
		"message": "",
		"parameters": {},
		"translateMessage": false,
		"translateParameters": []
	};

	if (!this.placementEntity || this.placementEntity[0] != cmd.template)
	{
		if (this.placementEntity)
			Engine.DestroyEntity(this.placementEntity[1]);

		if (cmd.template == "")
			this.placementEntity = undefined;
		else
			this.placementEntity = [cmd.template, Engine.AddLocalEntity(`preview|${cmd.template}`)];
	}

	if (this.placementEntity)
	{
		const ent = this.placementEntity[1];

		const pos = Engine.QueryInterface(ent, IID_Position);
		if (pos)
		{
			pos.JumpTo(cmd.x, cmd.z);
			pos.SetYRotation(cmd.angle);
		}

		const cmpOwnership = Engine.QueryInterface(ent, IID_Ownership);
		cmpOwnership.SetOwner(player);

		const cmpBuildRestrictions = Engine.QueryInterface(ent, IID_BuildRestrictions);
		if (!cmpBuildRestrictions)
			error("cmpBuildRestrictions not defined");
		else
			result = cmpBuildRestrictions.CheckPlacement();

		const cmpRangeOverlayManager = Engine.QueryInterface(ent, IID_RangeOverlayManager);
		if (cmpRangeOverlayManager)
			cmpRangeOverlayManager.SetEnabled(true, this.enabledVisualRangeOverlayTypes);

		// Set it to a red shade if this is an invalid location.
		const cmpVisual = Engine.QueryInterface(ent, IID_Visual);
		if (cmpVisual)
		{
			if (cmd.actorSeed !== undefined)
				cmpVisual.SetActorSeed(cmd.actorSeed);

			if (!result.success)
				cmpVisual.SetShadingColor(1.4, 0.4, 0.4, 1);
			else
				cmpVisual.SetShadingColor(0.4, 1.4, 0.4, 1);
		}
	}

	return result;
};

GuiInterface.prototype.SetWallPlacementPreview = function(player, cmd)
{
	const wallSet = cmd.wallSet;
	const start = {
		"pos": cmd.start,
		"angle": 0,
		"snapped": false,
		"snappedEnt": INVALID_ENTITY
	};
	const end = {
		"pos": cmd.end,
		"angle": 0,
		"snapped": false,
		"snappedEnt": INVALID_ENTITY
	};
	if (!this.placementWallEntities)
		this.placementWallEntities = {};

	if (!wallSet)
	{
		for (const tpl in this.placementWallEntities)
		{
			for (const ent of this.placementWallEntities[tpl].entities)
				Engine.DestroyEntity(ent);

			this.placementWallEntities[tpl].numUsed = 0;
			this.placementWallEntities[tpl].entities = [];
		}

		return false;
	}

	for (const tpl in this.placementWallEntities)
	{
		for (const ent of this.placementWallEntities[tpl].entities)
		{
			const pos = Engine.QueryInterface(ent, IID_Position);
			if (pos)
				pos.MoveOutOfWorld();
		}

		this.placementWallEntities[tpl].numUsed = 0;
	}
	for (const type in wallSet.templates)
	{
		if (type == "curves")
			continue;

		const tpl = wallSet.templates[type];
		if (!(tpl in this.placementWallEntities))
		{
			this.placementWallEntities[tpl] = {
				"numUsed": 0,
				"entities": [],
				"templateData": this.GetTemplateData(player, { "templateName": tpl })
			};

			if (!this.placementWallEntities[tpl].templateData.wallPiece)
			{
				error(`[SetWallPlacementPreview] No WallPiece component found for wall set template '${tpl}'`);
				return false;
			}
		}
	}
	if (end.pos && (start.pos.x === end.pos.x && start.pos.z === end.pos.z))
		end.pos = undefined;
	if (cmd.snapEntities)
	{
		const snapRadius = this.placementWallEntities[wallSet.templates.tower].templateData.wallPiece.length * 0.5;
		const startSnapData = this.GetFoundationSnapData(player, {
			"x": start.pos.x,
			"z": start.pos.z,
			"template": wallSet.templates.tower,
			"snapEntities": cmd.snapEntities,
			"snapRadius": snapRadius
		});

		if (startSnapData)
		{
			start.pos.x = startSnapData.x;
			start.pos.z = startSnapData.z;
			start.angle = startSnapData.angle;
			start.snapped = true;

			if (startSnapData.ent)
				start.snappedEnt = startSnapData.ent;
		}

		if (end.pos)
		{
			const endSnapData = this.GetFoundationSnapData(player, {
				"x": end.pos.x,
				"z": end.pos.z,
				"template": wallSet.templates.tower,
				"snapEntities": cmd.snapEntities,
				"snapRadius": snapRadius
			});

			if (endSnapData)
			{
				end.pos.x = endSnapData.x;
				end.pos.z = endSnapData.z;
				end.angle = endSnapData.angle;
				end.snapped = true;

				if (endSnapData.ent)
					end.snappedEnt = endSnapData.ent;
			}
		}
	}
	this.SetBuildingPlacementPreview(player, { "template": "" });
	const result = {
		"pieces": [],
		"cost": { "population": 0, "time": 0 }
	};
	for (const res of Resources.GetCodes())
		result.cost[res] = 0;

	let previewEntities = [];
	if (end.pos)
		previewEntities = GetWallPlacement(this.placementWallEntities, wallSet, start, end);
	if (start.snappedEnt && start.snappedEnt != INVALID_ENTITY)
	{
		const startEntObstruction = Engine.QueryInterface(start.snappedEnt, IID_Obstruction);
		if (previewEntities.length && startEntObstruction)
			previewEntities[0].controlGroups = [startEntObstruction.GetControlGroup()];

		// If we're snapping to merely a foundation, add an extra preview tower and also set it to the same control group.
		const startEntState = this.GetEntityState(player, start.snappedEnt);
		if (startEntState.foundation)
		{
			const cmpPosition = Engine.QueryInterface(start.snappedEnt, IID_Position);
			if (cmpPosition)
				previewEntities.unshift({
					"template": wallSet.templates.tower,
					"pos": start.pos,
					"angle": cmpPosition.GetRotation().y,
					"controlGroups": [startEntObstruction ? startEntObstruction.GetControlGroup() : undefined],
					"excludeFromResult": true // Preview only, must not appear in the result.
				});
		}
	}
	else
		previewEntities.unshift({
			"template": wallSet.templates.tower,
			"pos": start.pos,
			"angle": previewEntities.length ? previewEntities[0].angle : this.placementWallLastAngle
		});

	if (end.pos)
	{
		if (end.snappedEnt && end.snappedEnt != INVALID_ENTITY)
		{
			const endEntObstruction = Engine.QueryInterface(end.snappedEnt, IID_Obstruction);
			if (previewEntities.length > 0 && endEntObstruction)
			{
				previewEntities[previewEntities.length - 1].controlGroups = previewEntities[previewEntities.length - 1].controlGroups || [];
				previewEntities[previewEntities.length - 1].controlGroups.push(endEntObstruction.GetControlGroup());
			}

			// If we're snapping to a foundation, add an extra preview tower and also set it to the same control group.
			const endEntState = this.GetEntityState(player, end.snappedEnt);
			if (endEntState.foundation)
			{
				const cmpPosition = Engine.QueryInterface(end.snappedEnt, IID_Position);
				if (cmpPosition)
					previewEntities.push({
						"template": wallSet.templates.tower,
						"pos": end.pos,
						"angle": cmpPosition.GetRotation().y,
						"controlGroups": [endEntObstruction ? endEntObstruction.GetControlGroup() : undefined],
						"excludeFromResult": true
					});
			}
		}
		else
			previewEntities.push({
				"template": wallSet.templates.tower,
				"pos": end.pos,
				"angle": previewEntities.length ? previewEntities[previewEntities.length - 1].angle : this.placementWallLastAngle
			});
	}

	const cmpTerrain = Engine.QueryInterface(SYSTEM_ENTITY, IID_Terrain);
	if (!cmpTerrain)
	{
		error("[SetWallPlacementPreview] System Terrain component not found");
		return false;
	}

	const cmpRangeManager = Engine.QueryInterface(SYSTEM_ENTITY, IID_RangeManager);
	if (!cmpRangeManager)
	{
		error("[SetWallPlacementPreview] System RangeManager component not found");
		return false;
	}
	let allPiecesValid = true;
	let numRequiredPieces = 0;

	for (let i = 0; i < previewEntities.length; ++i)
	{
		const entInfo = previewEntities[i];

		let ent = null;
		const tpl = entInfo.template;
		const tplData = this.placementWallEntities[tpl].templateData;
		const entPool = this.placementWallEntities[tpl];

		if (entPool.numUsed >= entPool.entities.length)
		{
			ent = Engine.AddLocalEntity(`preview|${tpl}`);
			entPool.entities.push(ent);
		}
		else
			ent = entPool.entities[entPool.numUsed];

		if (!ent)
		{
			error(`[SetWallPlacementPreview] Failed to allocate or reuse preview entity of template '${tpl}'`);
			continue;
		}
		const cmpPosition = Engine.QueryInterface(ent, IID_Position);
		if (cmpPosition)
		{
			cmpPosition.JumpTo(entInfo.pos.x, entInfo.pos.z);
			cmpPosition.SetYRotation(entInfo.angle);
			if (tpl === wallSet.templates.tower)
			{
				let terrainGroundPrev = null;
				let terrainGroundNext = null;

				if (i > 0)
					terrainGroundPrev = cmpTerrain.GetGroundLevel(previewEntities[i - 1].pos.x, previewEntities[i - 1].pos.z);

				if (i < previewEntities.length - 1)
					terrainGroundNext = cmpTerrain.GetGroundLevel(previewEntities[i + 1].pos.x, previewEntities[i + 1].pos.z);

				if (terrainGroundPrev != null || terrainGroundNext != null)
				{
					const targetY = Math.max(terrainGroundPrev, terrainGroundNext);
					cmpPosition.SetHeightFixed(targetY);
				}
			}
		}

		const cmpObstruction = Engine.QueryInterface(ent, IID_Obstruction);
		if (!cmpObstruction)
		{
			error(`[SetWallPlacementPreview] Preview entity of template '${tpl}' does not have an Obstruction component`);
			continue;
		}

		let primaryControlGroup = ent;
		let secondaryControlGroup = INVALID_ENTITY;

		if (entInfo.controlGroups && entInfo.controlGroups.length > 0)
		{
			if (entInfo.controlGroups.length > 2)
			{
				error(`[SetWallPlacementPreview] Encountered preview entity of template '${tpl}' with more than 2 initial control groups`);
				break;
			}

			primaryControlGroup = entInfo.controlGroups[0];
			if (entInfo.controlGroups.length > 1)
				secondaryControlGroup = entInfo.controlGroups[1];
		}

		cmpObstruction.SetControlGroup(primaryControlGroup);
		cmpObstruction.SetControlGroup2(secondaryControlGroup);

		let validPlacement = false;

		const cmpOwnership = Engine.QueryInterface(ent, IID_Ownership);
		cmpOwnership.SetOwner(player);
		const visible = cmpRangeManager.GetLosVisibility(ent, player) != "hidden";
		if (visible)
		{
			const cmpBuildRestrictions = Engine.QueryInterface(ent, IID_BuildRestrictions);
			if (!cmpBuildRestrictions)
			{
				error(`[SetWallPlacementPreview] cmpBuildRestrictions not defined for preview entity of template '${tpl}'`);
				continue;
			}
			validPlacement = cmpBuildRestrictions && cmpBuildRestrictions.CheckPlacement().success;
			if (validPlacement && entInfo.controlGroups && entInfo.controlGroups.length > 1)
				validPlacement = cmpObstruction.CheckDuplicateFoundation();
		}

		allPiecesValid = allPiecesValid && validPlacement;

		if (!entInfo.excludeFromResult)
			++numRequiredPieces;

		if (allPiecesValid && !entInfo.excludeFromResult)
		{
			result.pieces.push({
				"template": tpl,
				"x": entInfo.pos.x,
				"z": entInfo.pos.z,
				"angle": entInfo.angle
			});
			this.placementWallLastAngle = entInfo.angle;
			for (const res of Resources.GetCodes().concat(["population", "time"]))
				result.cost[res] += tplData.cost[res];
		}

		let canAfford = true;
		const cmpPlayer = QueryPlayerIDInterface(player, IID_Player);
		if (cmpPlayer && cmpPlayer.GetNeededResources(result.cost))
			canAfford = false;

		const cmpVisual = Engine.QueryInterface(ent, IID_Visual);
		if (cmpVisual)
		{
			if (!allPiecesValid || !canAfford)
				cmpVisual.SetShadingColor(1.4, 0.4, 0.4, 1);
			else
				cmpVisual.SetShadingColor(0.4, 1.4, 0.4, 1);
		}

		++entPool.numUsed;
	}

	if (numRequiredPieces > 0 && result.pieces.length == 0)
		return false;

	if (start.snappedEnt && start.snappedEnt != INVALID_ENTITY)
		result.startSnappedEnt = start.snappedEnt;

	if (end.pos && end.snappedEnt && end.snappedEnt != INVALID_ENTITY && allPiecesValid)
		result.endSnappedEnt = end.snappedEnt;

	return result;
};


// Original variable declaration is prefixed with let instead of var so we can't
// just add new entries directly (global let declaration rules)
var boongui_exposedFunctions = {
	"boongui_GetOverlay": 1,
	"DisplayRallyPoint": 1,
	"HoverSelectionHighlight": 1
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

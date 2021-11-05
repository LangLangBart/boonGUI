// Fills out information that most entities have
function displaySingle(entState)
{
	let template = GetTemplateData(entState.template);

	let primaryName = g_SpecificNamesPrimary ? template.name.specific : template.name.generic;
	let secondaryName;
	if (g_ShowSecondaryNames)
		secondaryName = g_SpecificNamesPrimary ? template.name.generic : template.name.specific;

	// If packed, add that to the generic name (reduces template clutter).
	if (template.pack && template.pack.state == "packed")
	{
		if (secondaryName && g_ShowSecondaryNames)
			secondaryName = sprintf(translate("%(secondaryName)s — Packed"), { "secondaryName": secondaryName });
		else
			secondaryName = sprintf(translate("Packed"));
	}
	let playerState = g_Players[entState.player];

	let civName = g_CivData[playerState.civ].Name;
	let civEmblem = g_CivData[playerState.civ].Emblem;

	let playerName = playerState.name;

	// Indicate disconnected players by prefixing their name
	if (g_Players[entState.player].offline)
		playerName = sprintf(translate("\\[OFFLINE] %(player)s"), { "player": playerName });

	// Rank
	if (entState.identity && entState.identity.rank && entState.identity.classes)
	{
		Engine.GetGUIObjectByName("rankIcon").tooltip = sprintf(translate("%(rank)s Rank"), {
			"rank": translateWithContext("Rank", entState.identity.rank)
		});
		Engine.GetGUIObjectByName("rankIcon").sprite = "stretched:session/icons/ranks/" + entState.identity.rank + ".png";
		Engine.GetGUIObjectByName("rankIcon").hidden = false;
	}
	else
	{
		Engine.GetGUIObjectByName("rankIcon").hidden = true;
		Engine.GetGUIObjectByName("rankIcon").tooltip = "";
	}

	if (entState.statusEffects)
	{
		let statusEffectsSection = Engine.GetGUIObjectByName("statusEffectsIcons");
		statusEffectsSection.hidden = false;
		let statusIcons = statusEffectsSection.children;
		let i = 0;
		for (let effectCode in entState.statusEffects)
		{
			let effect = entState.statusEffects[effectCode];
			statusIcons[i].hidden = false;
			statusIcons[i].sprite = "stretched:session/icons/status_effects/" + g_StatusEffectsMetadata.getIcon(effect.baseCode) + ".png";
			statusIcons[i].tooltip = getStatusEffectsTooltip(effect.baseCode, effect, false);
			let size = statusIcons[i].size;
			size.top = i * 18;
			size.bottom = i * 18 + 16;
			statusIcons[i].size = size;

			if (++i >= statusIcons.length)
				break;
		}
		for (; i < statusIcons.length; ++i)
			statusIcons[i].hidden = true;
	}
	else
		Engine.GetGUIObjectByName("statusEffectsIcons").hidden = true;

	let showHealth = entState.hitpoints;
	let showResource = entState.resourceSupply;
	let showCapture = entState.capturePoints;

	let healthSection = Engine.GetGUIObjectByName("healthSection");
	let captureSection = Engine.GetGUIObjectByName("captureSection");
	let resourceSection = Engine.GetGUIObjectByName("resourceSection");
	let sectionPosTop = Engine.GetGUIObjectByName("sectionPosTop");
	let sectionPosMiddle = Engine.GetGUIObjectByName("sectionPosMiddle");
	let sectionPosBottom = Engine.GetGUIObjectByName("sectionPosBottom");

	// Hitpoints
	healthSection.hidden = !showHealth;
	if (showHealth)
	{
		let unitHealthBar = Engine.GetGUIObjectByName("healthBar");
		let healthSize = unitHealthBar.size;
		healthSize.rright = 100 * Math.max(0, Math.min(1, entState.hitpoints / entState.maxHitpoints));
		unitHealthBar.size = healthSize;
		Engine.GetGUIObjectByName("healthStats").caption = sprintf(translate("%(hitpoints)s / %(maxHitpoints)s"), {
			"hitpoints": Math.ceil(entState.hitpoints),
			"maxHitpoints": Math.ceil(entState.maxHitpoints)
		});

	}

	// CapturePoints
	captureSection.hidden = !entState.capturePoints;
	if (entState.capturePoints)
	{
		let setCaptureBarPart = function(playerID, startSize) {
			let unitCaptureBar = Engine.GetGUIObjectByName("captureBar[" + playerID + "]");
			let sizeObj = unitCaptureBar.size;
			sizeObj.rleft = startSize;

			let size = 100 * Math.max(0, Math.min(1, entState.capturePoints[playerID] / entState.maxCapturePoints));
			sizeObj.rright = startSize + size;
			unitCaptureBar.size = sizeObj;
			unitCaptureBar.sprite = "color:" + g_DiplomacyColors.getPlayerColor(playerID, 200);
			unitCaptureBar.hidden = false;
			return startSize + size;
		};

		// first handle the owner's points, to keep those points on the left for clarity
		let size = setCaptureBarPart(entState.player, 0);

		for (let i in entState.capturePoints)
			if (i != entState.player)
				size = setCaptureBarPart(i, size);

		let captureText = sprintf(translate("%(capturePoints)s / %(maxCapturePoints)s"), {
			"capturePoints": Math.ceil(entState.capturePoints[entState.player]),
			"maxCapturePoints": Math.ceil(entState.maxCapturePoints)
		});

		Engine.GetGUIObjectByName("captureStats").caption = captureText;
	}

	// Experience
	Engine.GetGUIObjectByName("experience").hidden = !entState.promotion;
	if (entState.promotion)
	{
		let experienceBar = Engine.GetGUIObjectByName("experienceBar");
		let experienceSize = experienceBar.size;
		experienceSize.rtop = 100 - (100 * Math.max(0, Math.min(1, 1.0 * +entState.promotion.curr / (+entState.promotion.req || 1))));
		experienceBar.size = experienceSize;

		if (entState.promotion.curr < entState.promotion.req)
			Engine.GetGUIObjectByName("experience").tooltip = sprintf(translate("%(experience)s %(current)s / %(required)s"), {
				"experience": "[font=\"sans-bold-13\"]" + translate("Experience:") + "[/font]",
				"current": Math.floor(entState.promotion.curr),
				"required": Math.ceil(entState.promotion.req)
			});
		else
			Engine.GetGUIObjectByName("experience").tooltip = sprintf(translate("%(experience)s %(current)s"), {
				"experience": "[font=\"sans-bold-13\"]" + translate("Experience:") + "[/font]",
				"current": Math.floor(entState.promotion.curr)
			});
	}

	// Resource stats
	resourceSection.hidden = !showResource;
	if (entState.resourceSupply)
	{
		let resources = entState.resourceSupply.isInfinite ? translate("∞") :  // Infinity symbol
			sprintf(translate("%(amount)s / %(max)s"), {
				"amount": Math.ceil(+entState.resourceSupply.amount),
				"max": entState.resourceSupply.max
			});

		let unitResourceBar = Engine.GetGUIObjectByName("resourceBar");
		let resourceSize = unitResourceBar.size;

		resourceSize.rright = entState.resourceSupply.isInfinite ? 100 :
			100 * Math.max(0, Math.min(1, +entState.resourceSupply.amount / +entState.resourceSupply.max));
		unitResourceBar.size = resourceSize;

		Engine.GetGUIObjectByName("resourceStats").caption = resources;
		Engine.GetGUIObjectByName("resourceStats").tooltip = resourceNameFirstWord(entState.resourceSupply.type.generic);
	}

	let resourceCarryingIcon = Engine.GetGUIObjectByName("resourceCarryingIcon");
	let resourceCarryingText = Engine.GetGUIObjectByName("resourceCarryingText");
	resourceCarryingIcon.hidden = false;
	resourceCarryingText.hidden = false;

	// Resource carrying
	if (entState.resourceCarrying && entState.resourceCarrying.length)
	{
		// We should only be carrying one resource type at once, so just display the first
		let carried = entState.resourceCarrying[0];
		resourceCarryingIcon.sprite = "stretched:session/icons/resources/" + carried.type + ".png";
		resourceCarryingText.caption = sprintf(translate("%(amount)s / %(max)s"), { "amount": carried.amount, "max": carried.max });
		resourceCarryingIcon.tooltip = "";
	}
	// Use the same indicators for traders
	else if (entState.trader && entState.trader.goods.amount)
	{
		resourceCarryingIcon.sprite = "stretched:session/icons/resources/" + entState.trader.goods.type + ".png";
		let totalGain = entState.trader.goods.amount.traderGain;
		if (entState.trader.goods.amount.market1Gain)
			totalGain += entState.trader.goods.amount.market1Gain;
		if (entState.trader.goods.amount.market2Gain)
			totalGain += entState.trader.goods.amount.market2Gain;
		resourceCarryingText.caption = totalGain;
		resourceCarryingIcon.tooltip = sprintf(translate("Gain: %(gain)s"), {
			"gain": getTradingTooltip(entState.trader.goods.amount)
		});
	}
	// And for number of workers
	else if (entState.foundation)
	{
		resourceCarryingIcon.sprite = "stretched:session/icons/repair.png";
		resourceCarryingIcon.tooltip = getBuildTimeTooltip(entState);
		resourceCarryingText.caption = entState.foundation.numBuilders ? sprintf(translate("(%(number)s)\n%(time)s"), {
			"number": entState.foundation.numBuilders,
			"time": Engine.FormatMillisecondsIntoDateStringGMT(entState.foundation.buildTime.timeRemaining * 1000, translateWithContext("countdown format", "m:ss"))
		}) : "";
	}
	else if (entState.resourceSupply && (!entState.resourceSupply.killBeforeGather || !entState.hitpoints))
	{
		resourceCarryingIcon.sprite = "stretched:session/icons/repair.png";
		resourceCarryingText.caption = sprintf(translate("%(amount)s / %(max)s"), {
			"amount": entState.resourceSupply.numGatherers,
			"max": entState.resourceSupply.maxGatherers
		});
		Engine.GetGUIObjectByName("resourceCarryingIcon").tooltip = translate("Current/max gatherers");
	}
	else if (entState.repairable && entState.needsRepair)
	{
		resourceCarryingIcon.sprite = "stretched:session/icons/repair.png";
		resourceCarryingIcon.tooltip = getRepairTimeTooltip(entState);
		resourceCarryingText.caption = entState.repairable.numBuilders ? sprintf(translate("(%(number)s)\n%(time)s"), {
			"number": entState.repairable.numBuilders,
			"time": Engine.FormatMillisecondsIntoDateStringGMT(entState.repairable.buildTime.timeRemaining * 1000, translateWithContext("countdown format", "m:ss"))
		}) : "";
	}
	else
	{
		resourceCarryingIcon.hidden = true;
		resourceCarryingText.hidden = true;
	}

	Engine.GetGUIObjectByName("player").caption = playerName;

	Engine.GetGUIObjectByName("playerColorBackground").sprite =
		"color:" + g_DiplomacyColors.getPlayerColor(entState.player, 128);

	const hideSecondary = !secondaryName || primaryName == secondaryName;

	const primaryObject = Engine.GetGUIObjectByName("primary");
	primaryObject.caption = primaryName;
	const primaryObjectSize = primaryObject.size;
	primaryObjectSize.rbottom = hideSecondary ? 100 : 50;
	primaryObject.size = primaryObjectSize;

	const secondaryObject = Engine.GetGUIObjectByName("secondary");
	secondaryObject.caption = hideSecondary ? "" :
		sprintf(translate("(%(secondaryName)s)"), {
			"secondaryName": secondaryName
		});
	secondaryObject.hidden = hideSecondary;

	let isGaia = playerState.civ == "gaia";
	Engine.GetGUIObjectByName("playerCivIcon").sprite = isGaia ? "" : "cropped:1.0, 0.15625 center:grayscale:" + civEmblem;
	Engine.GetGUIObjectByName("player").tooltip = isGaia ? "" : civName;

	// TODO: we should require all entities to have icons
	Engine.GetGUIObjectByName("icon").sprite = template.icon ? ("stretched:session/portraits/" + template.icon) : "BackgroundBlack";
	if (template.icon)
		Engine.GetGUIObjectByName("iconBorder").onPressRight = () => {
			showTemplateDetails(entState.template, playerState.civ);
		};
	
	// wraitii's code for SetupStat 
	let SetupStat = (panel, i, icon, text, tooltip) => {
		const panelItem = Engine.GetGUIObjectByName(`${panel}[${i}]`);
		const panelIcon = Engine.GetGUIObjectByName(`${panel}Icon[${i}]`); 
		const panelText = Engine.GetGUIObjectByName(`${panel}Text[${i}]`); 
		if (!text)
		{
			panelItem.hidden = true;
			return;
		}
		panelItem.hidden = false;
		panelIcon.sprite = "stretched:color:0 0 0 20:textureAsMask:" + icon;
		let size = panelItem.size;
		size.top = 35*i;
		size.bottom = 35*i+24;
		panelItem.size = size;
		panelText.tooltip = tooltip;
		panelIcon.tooltip = tooltip;
		panelText.caption = text;
	};

	// Left-hand side of the stats panel
	// Attack per second
	let projectiles = 1;
	if (template.buildingAI)
		projectiles = template.buildingAI.arrowCount || template.buildingAI.defaultArrowCount;
	if (!!template?.attack?.Melee || !!template?.attack?.Ranged)
	{
		let attackPower = (template?.attack?.Melee || template?.attack?.Ranged)?.Damage;
		attackPower = (attackPower?.Hack || 0) + (attackPower?.Pierce || 0) + (attackPower?.Crush || 0);
		SetupStat("LHS", 0, "session/icons/attackPower.png", (limitNumber(attackPower*projectiles / (template?.attack?.Melee || template?.attack?.Ranged).repeatTime * 1000)), "Attack per Second");
	}
	else
		SetupStat("LHS", 0, "" , "");

	// Agility
	if (!!template?.speed)
	{
		let walkSpeed = template?.speed?.walk || 0;
		SetupStat("LHS", 1, "session/icons/walk.png", (limitNumber(walkSpeed)), "Walk Speed");
	}
	else
		SetupStat("LHS", 1, "", "");

	// Range
	if (!!template?.attack?.Ranged)
		SetupStat("LHS", 2, "session/icons/range.png", template.attack.Ranged.maxRange || 0, "Range Attack");
	else
		SetupStat("LHS", 2, "", "");

	// Right-hand side -> resistances
	if (!!template?.resistance?.Damage)
	{
		SetupStat("RHS", 0, "session/icons/res_hack.png", template.resistance.Damage?.Hack || 0, "Hack Resitance");
		SetupStat("RHS", 1, "session/icons/res_pierce.png", template.resistance.Damage?.Pierce || 0, "Pierce Resitance");
		SetupStat("RHS", 2, "session/icons/res_crush.png", template.resistance.Damage?.Crush || 0, "Crush Resitance");
	}
	else
	{
		SetupStat("RHS", 0, "", "");
		SetupStat("RHS", 1, "", "");
		SetupStat("RHS", 2, "", "");
	}

	let detailedTooltip = [
		getAttackTooltip,
		getHealerTooltip,
		getResistanceTooltip,
		getGatherTooltip,
		getSpeedTooltip,
		getGarrisonTooltip,
		getTurretsTooltip,
		getPopulationBonusTooltip,
		getProjectilesTooltip,
		getResourceTrickleTooltip,
		getUpkeepTooltip,
		getLootTooltip
	].map(func => func(entState)).filter(tip => tip).join("\n");
	if (detailedTooltip)
	{
		Engine.GetGUIObjectByName("attackAndResistanceStats").hidden = true;
		Engine.GetGUIObjectByName("attackAndResistanceStats").tooltip = detailedTooltip;
	}
	else
		Engine.GetGUIObjectByName("attackAndResistanceStats").hidden = true;

	let iconTooltips = [];

	iconTooltips.push(setStringTags(primaryName, g_TooltipTextFormats.namePrimaryBig));
	iconTooltips = iconTooltips.concat([
		getVisibleEntityClassesFormatted,
		getAurasTooltip,
		getEntityTooltip,
		getTreasureTooltip,
		showTemplateViewerOnRightClickTooltip
	].map(func => func(template)));

	Engine.GetGUIObjectByName("iconBorder").tooltip = iconTooltips.filter(tip => tip).join("\n");

	Engine.GetGUIObjectByName("detailsAreaSingle").hidden = false;
	Engine.GetGUIObjectByName("detailsAreaMultiple").hidden = true;
}

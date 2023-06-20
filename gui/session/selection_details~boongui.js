// wraitii's code for SetupStat
function SetupStat(panel, index, icon, text, tooltip)
{
	const panelItem = Engine.GetGUIObjectByName(`${panel}[${index}]`);
	const panelIcon = Engine.GetGUIObjectByName(`${panel}Icon[${index}]`);
	const panelText = Engine.GetGUIObjectByName(`${panel}Text[${index}]`);
	if (!text)
	{
		panelItem.hidden = true;
		return;
	}
	panelItem.hidden = false;
	panelIcon.sprite = `stretched:color:0 0 0 20:textureAsMask:${icon}`;
	const size = panelItem.size;
	size.top = 35 * index;
	size.bottom = 35 * index + 24;
	panelItem.size = size;
	panelText.tooltip = tooltip;
	panelIcon.tooltip = tooltip;
	panelText.caption = text;
}

// Fills out information that most entities have
function displaySingle(entState)
{
	const template = GetTemplateData(entState.template);

	const primaryName = g_SpecificNamesPrimary ? template.name.specific : template.name.generic;
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
	const playerState = g_Players[entState.player];

	const civName = g_CivData[playerState.civ].Name;
	const civEmblem = g_CivData[playerState.civ].Emblem;

	let playerName = playerState.name;

	// Indicate disconnected players by prefixing their name
	if (g_Players[entState.player].offline)
		playerName = sprintf(translate("\\[OFFLINE] %(player)s"), { "player": playerName });

	// Rank
	if (entState.identity && entState.identity.rank && entState.identity.classes)
	{
		const rankObj = GetTechnologyData(entState.identity.rankTechName, playerState.civ);
		Engine.GetGUIObjectByName("rankIcon").tooltip = sprintf(translate("%(rank)s Rank"), {
			"rank": translateWithContext("Rank", entState.identity.rank)
		}) + (rankObj ? `\n${rankObj.tooltip}` : "");
		Engine.GetGUIObjectByName("rankIcon").sprite = `stretched:session/icons/ranks/${entState.identity.rank}.png`;
		Engine.GetGUIObjectByName("rankIcon").hidden = false;
	}
	else
	{
		Engine.GetGUIObjectByName("rankIcon").hidden = true;
		Engine.GetGUIObjectByName("rankIcon").tooltip = "";
	}

	if (entState.statusEffects)
	{
		const statusEffectsSection = Engine.GetGUIObjectByName("statusEffectsIcons");
		statusEffectsSection.hidden = false;
		const statusIcons = statusEffectsSection.children;
		let i = 0;
		for (const effectCode in entState.statusEffects)
		{
			const effect = entState.statusEffects[effectCode];
			statusIcons[i].hidden = false;
			statusIcons[i].sprite = `stretched:session/icons/status_effects/${g_StatusEffectsMetadata.getIcon(effect.baseCode)}.png`;
			statusIcons[i].tooltip = getStatusEffectsTooltip(effect.baseCode, effect, false);
			const size = statusIcons[i].size;
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

	const showHealth = entState.hitpoints;
	const showResource = entState.resourceSupply;
	const showCapture = entState.capturePoints;

	const healthSection = Engine.GetGUIObjectByName("healthSection");
	const captureSection = Engine.GetGUIObjectByName("captureSection");
	const resourceSection = Engine.GetGUIObjectByName("resourceSection");
	const sectionPosTop = Engine.GetGUIObjectByName("sectionPosTop");
	const sectionPosMiddle = Engine.GetGUIObjectByName("sectionPosMiddle");
	const sectionPosBottom = Engine.GetGUIObjectByName("sectionPosBottom");

	// Hitpoints
	healthSection.hidden = !showHealth;
	if (showHealth)
	{
		const unitHealthBar = Engine.GetGUIObjectByName("healthBar");
		const healthSize = unitHealthBar.size;
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
		const setCaptureBarPart = function(playerID, startSize)
		{
			const unitCaptureBar = Engine.GetGUIObjectByName(`captureBar[${playerID}]`);
			const sizeObj = unitCaptureBar.size;
			sizeObj.rleft = startSize;

			const size = 100 * Math.max(0, Math.min(1, entState.capturePoints[playerID] / entState.maxCapturePoints));
			sizeObj.rright = startSize + size;
			unitCaptureBar.size = sizeObj;
			unitCaptureBar.sprite = `color:${g_DiplomacyColors.getPlayerColor(playerID, 200)}`;
			unitCaptureBar.hidden = false;
			return startSize + size;
		};

		// first handle the owner's points, to keep those points on the left for clarity
		let size = setCaptureBarPart(entState.player, 0);

		for (const i in entState.capturePoints)
			if (i != entState.player)
				size = setCaptureBarPart(i, size);

		const captureText = sprintf(translate("%(capturePoints)s / %(maxCapturePoints)s"), {
			"capturePoints": Math.ceil(entState.capturePoints[entState.player]),
			"maxCapturePoints": Math.ceil(entState.maxCapturePoints)
		});

		Engine.GetGUIObjectByName("captureStats").caption = captureText;
	}

	// Experience
	Engine.GetGUIObjectByName("experience").hidden = !entState.promotion;
	if (entState.promotion)
	{
		const experienceBar = Engine.GetGUIObjectByName("experienceBar");
		const experienceSize = experienceBar.size;
		experienceSize.rtop = 100 - (100 * Math.max(0, Math.min(1, 1.0 * +entState.promotion.curr / (+entState.promotion.req || 1))));
		experienceBar.size = experienceSize;

		if (entState.promotion.curr < entState.promotion.req)
			Engine.GetGUIObjectByName("experience").tooltip = sprintf(translate("%(experience)s %(current)s / %(required)s"), {
				"experience": `[font="sans-bold-13"]${translate("Experience:")}[/font]`,
				"current": Math.floor(entState.promotion.curr),
				"required": Math.ceil(entState.promotion.req)
			});
		else
			Engine.GetGUIObjectByName("experience").tooltip = sprintf(translate("%(experience)s %(current)s"), {
				"experience": `[font="sans-bold-13"]${translate("Experience:")}[/font]`,
				"current": Math.floor(entState.promotion.curr)
			});
	}

	// Resource stats
	resourceSection.hidden = !showResource;
	if (entState.resourceSupply)
	{
		const resources = entState.resourceSupply.isInfinite ? translate("∞") :  // Infinity symbol
			sprintf(translate("%(amount)s / %(max)s"), {
				"amount": Math.ceil(+entState.resourceSupply.amount),
				"max": entState.resourceSupply.max
			});

		const unitResourceBar = Engine.GetGUIObjectByName("resourceBar");
		const resourceSize = unitResourceBar.size;

		resourceSize.rright = entState.resourceSupply.isInfinite ? 100 :
			100 * Math.max(0, Math.min(1, +entState.resourceSupply.amount / +entState.resourceSupply.max));
		unitResourceBar.size = resourceSize;

		Engine.GetGUIObjectByName("resourceStats").caption = resources;
		Engine.GetGUIObjectByName("resourceStats").tooltip = resourceNameFirstWord(entState.resourceSupply.type.generic);
	}

	const resourceCarryingIcon = Engine.GetGUIObjectByName("resourceCarryingIcon");
	const resourceCarryingText = Engine.GetGUIObjectByName("resourceCarryingText");
	resourceCarryingIcon.hidden = false;
	resourceCarryingText.hidden = false;

	// Resource carrying
	if (entState.resourceCarrying && entState.resourceCarrying.length)
	{
		// Carrying one resource type at once, so just display the first
		const carried = entState.resourceCarrying[0];
		resourceCarryingIcon.sprite = `stretched:session/icons/resources/${carried.type}.png`;
		resourceCarryingText.caption = sprintf(translate("%(amount)s / %(max)s"), { "amount": carried.amount, "max": carried.max });
		resourceCarryingIcon.tooltip = "";
	}
	// Use the same indicators for traders
	else if (entState.trader && entState.trader.goods.amount)
	{
		resourceCarryingIcon.sprite = `stretched:session/icons/resources/${entState.trader.goods.type}.png`;
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
		`color:${g_DiplomacyColors.getPlayerColor(entState.player, 128)}`;

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

	const isGaia = playerState.civ == "gaia";
	Engine.GetGUIObjectByName("playerCivIcon").sprite = isGaia ? "" : `cropped:1.0, 0.15625 center:grayscale:${civEmblem}`;
	Engine.GetGUIObjectByName("player").tooltip = isGaia ? "" : civName;

	// TODO: we should require all entities to have icons
	Engine.GetGUIObjectByName("icon").sprite = template.icon ? (`stretched:session/portraits/${template.icon}`) : "BackgroundBlack";
	if (template.icon)
		Engine.GetGUIObjectByName("iconBorder").onPressRight = () => {
			showTemplateDetails(entState.template, playerState.civ);
		};

	// Left-hand side of the stats panel
	// Attack per second
	let projectiles = 1;
	if (entState.buildingAI)
		projectiles = entState.buildingAI.arrowCount || entState.buildingAI.defaultArrowCount;
	if (!!entState?.attack?.Melee || !!entState?.attack?.Ranged)
	{
		const attackType = entState?.attack?.Melee || entState?.attack?.Ranged;
		if (!attackType)
			warn(`The attackType for ${entState?.template} is undefined."`);
		const attackPower = (attackType?.Damage?.Hack || 0) + (attackType?.Damage?.Pierce || 0) + (attackType?.Damage?.Crush || 0);
		SetupStat("LHS", 0, "session/icons/attackPower.png", limitNumber(attackPower * projectiles / attackType.repeatTime * 1000), setupStatHUDAttackTooltip(entState, projectiles));
		SetupStat("FullSpace", 0, "", "");
	}
	else if (!!template?.treasure)
	{
		const treasureInfo = setupStatHUDTreasureInfo(template);
		SetupStat("LHS", 0, `session/icons/resources/${treasureInfo.resourceName}_small.png`, `${treasureInfo.resourceAmount}`, getTreasureTooltip(template));
		SetupStat("FullSpace", 0, "", "");
	}

	else if (template?.visibleIdentityClasses.includes("Relic"))
	{
		let text = [];
		for (const nameOfAuras in template.auras)
		{
			// we take the aura description and make an array of sentences
			const auraDescriptionCutInSentences = template.auras[nameOfAuras].description.match(/[^!.?]+[!.?]+/g);
			// the last sentence contains the important stuff we would like to display
			const auraSnippet = auraDescriptionCutInSentences.pop();
			// some of the description contains line breaks, we get rid of it here.
			text += `${coloredText("●", "orange") + auraSnippet.replace(/(\r\n|\n|\r)/gm, " ")}\n`;

			const radius = +template.auras[nameOfAuras].radius;
			if (radius)
				text += `${sprintf("%(label)s %(val)s %(unit)s", {
					"label": "Range:",
					"val": radius,
					"unit": unitFont("m")
				})}\n`;

		}
		const font = text.length < 280 ? "sans-13" : "sans-12";
		SetupStat("LHS", 0, "", "");
		SetupStat("FullSpace", 0, "", setStringTags(text, { font }), "");
	}

	else
	{
		SetupStat("LHS", 0, "", "");
		SetupStat("FullSpace", 0, "", "");
	}

	// Agility
	if (!!entState?.speed && !template?.visibleIdentityClasses.includes("Relic"))
	{
		const walkSpeed = entState?.speed?.walk || 0;
		SetupStat("LHS", 1, "session/icons/walk.png", limitNumber(walkSpeed), setupStatHUDSpeedTooltip(entState));
	}
	else
		SetupStat("LHS", 1, "", "");

	// Range
	// TODO Show the real range including elevation and tech bonus, list them in the tooltip
	if (entState?.attack?.Ranged)
		SetupStat("LHS", 2, "session/icons/range.png", entState.attack.Ranged.maxRange || 0, headerFont("Attack Range"));
	else
		SetupStat("LHS", 2, "", "");

	// Right-hand side -> resistances
	if (entState?.resistance?.Damage)
	{
		SetupStat("RHS", 0, "session/icons/res_hack.png", entState.resistance.Damage?.Hack || 0, setupStatHUDHackResistanceTooltip(entState));
		SetupStat("RHS", 1, "session/icons/res_pierce.png", entState.resistance.Damage?.Pierce || 0, setupStatHUDPierceResistanceTooltip(entState));
		SetupStat("RHS", 2, "session/icons/res_crush.png", entState.resistance.Damage?.Crush || 0, setupStatHUDCrushResistanceTooltip(entState));
	}
	else
	{
		SetupStat("RHS", 0, "", "");
		SetupStat("RHS", 1, "", "");
		SetupStat("RHS", 2, "", "");
	}

	const detailedTooltip = [
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
	].map(func => func(entState)).filter(Boolean).join("\n");
	if (detailedTooltip)
	{
		// for the relic we need the space to display text in the HUD and therefore it should be hidden.
		Engine.GetGUIObjectByName("attackAndResistanceStats").hidden = !!template?.visibleIdentityClasses.includes("Relic");
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

	Engine.GetGUIObjectByName("iconBorder").tooltip = iconTooltips.filter(Boolean).join("\n");

	Engine.GetGUIObjectByName("detailsAreaSingle").hidden = false;
	Engine.GetGUIObjectByName("detailsAreaMultiple").hidden = true;
}

// keep this in sync with Player~boongui.js
// used in Gamesetup to have the same colors as in the game
var g_vividColorsGamesetup = {
	"vividBlue": { "r": 0, "g": 160, "b": 255 },
	"vividRed": { "r": 255, "g": 0, "b": 0 },
	"vividGreen": { "r": 0, "g": 255, "b": 0 },
	"vividYellow": { "r": 255, "g": 255, "b": 0 },
	"vividCyan": { "r": 0, "g": 255, "b": 255 },
	"vividPurple": { "r": 157, "g": 97, "b": 255 },
	"vividOrange": { "r": 255, "g": 153, "b": 0 },
	"vividPink": { "r": 255, "g": 50, "b": 255 }
};

// It compares the old color with the  g_vividColorsGamesetup colors
function makeColorsVivid(oldColor)
{
	if (oldColor == g_Settings.PlayerDefaults[1].Color)
		return g_vividColorsGamesetup.vividBlue;
	if (oldColor == g_Settings.PlayerDefaults[2].Color)
		return g_vividColorsGamesetup.vividRed;
	if (oldColor == g_Settings.PlayerDefaults[3].Color)
		return g_vividColorsGamesetup.vividGreen;
	if (oldColor == g_Settings.PlayerDefaults[4].Color)
		return g_vividColorsGamesetup.vividYellow;
	if (oldColor == g_Settings.PlayerDefaults[5].Color)
		return g_vividColorsGamesetup.vividCyan;
	if (oldColor == g_Settings.PlayerDefaults[6].Color)
		return g_vividColorsGamesetup.vividPurple;
	if (oldColor == g_Settings.PlayerDefaults[7].Color)
		return g_vividColorsGamesetup.vividOrange;
	if (oldColor == g_Settings.PlayerDefaults[8].Color)
		return g_vividColorsGamesetup.vividPink;
	return oldColor;
}

// is used to format the K/D value
function formatKD(num)
{
	switch (true)
	{
	case (isNaN(num)):
		return "";
	case (!isFinite(num)):
		return translate("\u221E");
	case (num == 0 || num >= 10):
		return num.toFixed(0);
	case (num < 1):
		return num.toFixed(2);
	default:
		// avoid trailing zeros
		return Number(num.toFixed(1));
	}
}

// boonGUI: limit attack/speed numbers in the HUD
function limitNumber(num)
{
	if (num < 10)
	{
		return Number(num.toFixed(1));
	}
	return Math.round(num);
}

// boonGUI: colored right-click
function showTemplateViewerOnRightClickTooltip()
{
	// Translation: Appears in a tooltip to indicate that right-clicking the corresponding GUI element will open the Template Details GUI page.
	return translate(setStringTags("\\[Right-Click]", g_HotkeyTags) + " " + "to view more information.");
}

// boonGUI: Colored Click
function showTemplateViewerOnClickTooltip()
{
	// Translation: Appears in a tooltip to indicate that clicking the corresponding GUI element will open the Template Details GUI page.
	return translate(setStringTags("\\[Click]", g_HotkeyTags) + " " + "to view more information.");
}

function setupStatHUDAttackTooltip(template, projectiles)
{
	const tooltips = [];
	for (const attackType in template.attack)
	{
		// Slaughter is used to kill animals, so do not show it.
		// Capture is not needed here.
		if (["Slaughter", "Capture"].some(s => attackType.includes(s)))
			continue;

		const attackTypeTemplate = template.attack[attackType];
		const attackLabel = sprintf(headerFont(translate("%(attackType)s")), {
			"attackType": translateWithContext(attackTypeTemplate.attackName.context || "Name of an attack, usually the weapon.", attackTypeTemplate.attackName.name)
		});

		const splashTemplate = attackTypeTemplate.splash;

		// Show the effects of status effects below.
		let statusEffectsDetails = [];
		if (attackTypeTemplate.ApplyStatus)
			for (const status in attackTypeTemplate.ApplyStatus)
				statusEffectsDetails.push("\n" + g_Indent + g_Indent + getStatusEffectsTooltip(status, attackTypeTemplate.ApplyStatus[status], true));
		statusEffectsDetails = statusEffectsDetails.join("");

		tooltips.push(sprintf(translate("%(attackLabel)s: %(effects)s, %(rate)s%(statusEffects)s%(splash)s"), {
			"attackLabel": attackLabel,
			"effects": attackEffectsDetails(attackTypeTemplate),
			"rate": attackRateDetails(attackTypeTemplate.repeatTime, projectiles),
			"splash": splashTemplate ? "\n" + g_Indent + g_Indent + splashDetails(splashTemplate) : "",
			"statusEffects": statusEffectsDetails
		}));
	}

	return sprintf(translate("%(label)s %(details)s"), {
		"label": headerFont(translate("Damage per Second\n" + g_Indent)),
		"details": tooltips.join("\n" + g_Indent)
	});
}

function setupStatHUDHackResistanceTooltip(template)
{
	return sprintf(translate("%(label)s %(resistance)s %(explaination)s\n%(info)s"), {
		"label": headerFont(translate("Hack Resistance Level\n" + g_Indent)),
		"resistance": resistanceLevelToPercentageString(template.resistance.Damage.Hack),
		"explaination": unitFont(translate("Resistance against Hack Attacks")),
		"info": "Hack damage is usually inflicted in close combat by infantry or cavalry units."
	});
}

function setupStatHUDPierceResistanceTooltip(template)
{
	return sprintf(translate("%(label)s %(resistance)s %(explaination)s\n%(info)s"), {
		"label": headerFont(translate("Pierce Resistance Level\n" + g_Indent)),
		"resistance": resistanceLevelToPercentageString(template.resistance.Damage.Pierce),
		"explaination": unitFont(translate("Resistance against Pierce Attacks")),
		"info": "Pierce damage is dealt by ranged units e.g. archers, skirmishers or even special siege units such as bolt shooters."

	});
}

function setupStatHUDCrushResistanceTooltip(template)
{
	return sprintf(translate("%(label)s %(resistance)s %(explaination)s\n%(info)s"), {
		"label": headerFont(translate("Crush Resistance Level\n" + g_Indent)),
		"resistance": resistanceLevelToPercentageString(template.resistance.Damage.Crush),
		"explaination": unitFont(translate("Resistance against Crush Attacks")),
		"info": "Crush damage is mostly caused by siege units such as catapults or rams."

	});
}

function setupStatHUDSpeedTooltip(template)
{
	const walk = template.speed.walk.toFixed(1);
	const run = template.speed.run.toFixed(1);

	if (walk == 0 && run == 0)
		return "";
	const acceleration = template.speed.acceleration.toFixed(1);

	return sprintf(translate("%(label)s %(speeds)s"), {
		"label": headerFont(translate("Walk Speed\n" + g_Indent)),
		"speeds":
			sprintf(translate("%(speed)s %(movementType)s"), {
				"speed": walk,
				"movementType": unitFont(translate("Walk"))
			}) +
			commaFont(translate(", ")) +
			sprintf(translate("%(speed)s %(movementType)s"), {
				"speed": run,
				"movementType": unitFont(translate("Run"))
			}) +
			commaFont(translate(", ")) +
			sprintf(translate("%(speed)s %(movementType)s"), {
				"speed": acceleration,
				"movementType": unitFont(translate("Acceleration"))
			})
	});
}

function setupStatHUDTreasureInfo(template)
{
	const resources = {};
	for (const resource of g_ResourceData.GetResources())
	{
		const type = resource.code;
		if (template.treasure.resources[type])
			resources[type] = template.treasure.resources[type];
	}

	const resourceName = Object.keys(resources);
	if (!resourceName.length)
		return "";

	const resourceAmount = resourceName.map(type => resources[type]);
	return { resourceName, resourceAmount };
}

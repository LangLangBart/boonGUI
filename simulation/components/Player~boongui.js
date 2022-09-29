Player.prototype.GetColor = function()
{
	// keep this in sync with tooltips~boongui.js
	// GUIColor Properties r, g, b, a - The red/green/blue/alpha components of a colour, in the range 0.0 to 1.0.
	// Stick to even numbers after the decimal point, you cannot use an odd number, you would have to write it as a fraction, e.g. (179/255).
	// changes -Player1- blue to vivid blue
	if (this.color.r < 0.08236 && this.color.g < 0.21569 && this.color.b > 0.58430)
		return { "r": 0, "g": (160 / 255), "b": 1, "a": 1 };
	// changes -Player2- red to vivid red
	if (this.color.r > 0.58823 && this.color.g < 0.07844 && this.color.b < 0.07844)
		return { "r": 1, "g": 0, "b": 0, "a": 1 };
	// changes -Player3- green to vivid green
	if (this.color.r < 0.33726 && this.color.g > 0.70588 && this.color.b < 0.12157)
		return { "r": 0, "g": 1, "b": 0, "a": 1 };
	// changes -Player4- yellow to vivid yellow
	if (this.color.r > 0.90588 && this.color.g > 0.78431 && this.color.b < 0.01961)
		return { "r": 1, "g": 1, "b": 0, "a": 1 };
	// changes -Player5- cyan to vivid cyan
	if (this.color.r < 0.19608 && this.color.g > 0.66666 && this.color.b > 0.66666)
		return { "r": 0, "g": 1, "b": 1, "a": 1 };
	// changes -Player6- prurple to vivid purple
	if (this.color.r > 0.62745 && this.color.g < 0.31373 && this.color.b > 0.78431)
		return { "r": (157 / 255), "g": (97 / 255), "b": 1, "a": 1 };
	// changes -Player7- orange to vivid orange
	if (this.color.r > 0.86274 && this.color.g < 0.45099 && this.color.b < 0.06275)
		return { "r": 1, "g": 0.6, "b": 0, "a": 1 };
	// changes -Player8- grey to vivid pink
	if (this.color.r < 0.25099 && this.color.g < 0.25099 && this.color.b < 0.25099)
		return { "r": 1, "g": (50 / 255), "b": 1, "a": 1 };
	return this.color;
};

Player.prototype.GetDisplayedColor = function()
{
	// changes -Player1- blue to vivid blue
	if (this.displayDiplomacyColor)
		return this.diplomacyColor;
	else if (this.color.r < 0.08236 && this.color.g < 0.21569 && this.color.b > 0.58430)
		return { "r": 0, "g": (140 / 255), "b": 1, "a": 1 };
	// changes -Player2- red to vivid red
	else if (this.color.r > 0.58823 && this.color.g < 0.07844 && this.color.b < 0.07844)
		return { "r": 1, "g": 0, "b": 0, "a": 1 };
	// changes -Player3- green to vivid green
	else if (this.color.r < 0.33726 && this.color.g > 0.70588 && this.color.b < 0.12157)
		return { "r": 0, "g": 1, "b": 0, "a": 1 };
	// changes -Player4- yellow to vivid yellow
	else if (this.color.r > 0.90588 && this.color.g > 0.78431 && this.color.b < 0.01961)
		return { "r": 1, "g": 1, "b": 0, "a": 1 };
	// changes -Player5- cyan to vivid cyan
	else if (this.color.r < 0.19608 && this.color.g > 0.66666 && this.color.b > 0.66666)
		return { "r": 0, "g": 1, "b": 1, "a": 1 };
	// changes -Player6- purple to vivid purple
	else if (this.color.r > 0.62745 && this.color.g < 0.31373 && this.color.b > 0.78431)
		return { "r": (157 / 255), "g": (97 / 255), "b": 1, "a": 1 };
	// changes -Player7- orange to vivid orange
	else if (this.color.r > 0.86274 && this.color.g < 0.45099 && this.color.b < 0.06275)
		return { "r": 1, "g": 0.6, "b": 0, "a": 1 };
	// changes -Player8- grey to vivid pink
	else if (this.color.r < 0.25099 && this.color.g < 0.25099 && this.color.b < 0.25099)
		return { "r": 1, "g": (50 / 255), "b": 1, "a": 1 };
	return this.color;
};

Engine.ReRegisterComponentType(IID_Player, "Player", Player);

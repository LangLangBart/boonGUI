class BoonGUIColorScales {

	/**
     * @private
     * @type {Map<string, { min: number; max: number;}>}
     * */
	scales = new Map();

	reset() {
		this.scales.clear();
	}

	/**
     * @param {string} key
     * @param {number} value
     */
	addValue(key, value) {
		if (isNaN(value) || !isFinite(value)) return;
		let scale = this.scales.get(key);
		if (scale)
		{
			scale.min = Math.min(scale.min, value);
			scale.max = Math.max(scale.max, value);
		}
		else
		{
			scale = { "min": value, "max": value };
			this.scales.set(key, scale);
		}
	}

	/**
     * @param {string} key
     * @param {number} value
     * @param {number} alpha
     */
	getColor(key, value, reverse = false, alpha = 255) {
		const scale = this.scales.get(key);
		if (!scale) return "white";
		const range = scale.max - scale.min;
		if (range === 0 || !isFinite(range) || value == null) return "white";
		let percent = (value - scale.min) / range;
		if (isNaN(percent)) return null;
		percent = percent < 0 ? 0 : percent > 1 ? 1 : percent;
		if (reverse)
			percent = 1 - percent;
		let r, g, b;
		if (percent <= 0.5)
		{
			r = 255;
			g = Math.floor(100 + (155 * percent * 2));
			b = Math.floor(100 + (155 * percent * 2));
		}
		else
		{
			r = Math.floor(200 + (55 * (1 - percent) * 2));
			g = Math.floor(220 + (35 * (1 - percent) * 2));
			b = Math.floor(0 + (255 * (1 - percent) * 2));
		}
		return `${r} ${g} ${b} ${alpha}`;
	}
}

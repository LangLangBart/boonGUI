class BoonGUIColorScale {
    min = null;
    max = null;

    addValue(value) {
        this.min = this.min == null ? value : Math.min(this.min, value);
        this.max = this.max == null ? value : Math.max(this.max, value);
    }

    getColor(value) {
        if (this.min == null || this.max == null ) return null;
        const range = this.max - this.min;
        if (range === 0 || !isFinite(range) || value == null) return null;
        let percent = (value - this.min) / range;
        if (isNaN(percent)) return null;
        percent = percent < 0 ? 0 : percent > 1 ? 1 : percent;
        let r,g,b;
        if (percent <= 0.5) {
            r = 255;
            g = Math.floor(100 + (155 * percent * 2));
            b = Math.floor(100 + (155 * percent * 2));
        } else {
            r = Math.floor(200 + (55 * (1 - percent) * 2));
            g = Math.floor(220 + (35 * (1 - percent) * 2));
            b = Math.floor(0   + (255 * (1 - percent) * 2));
        }
        return `${r} ${g} ${b}`;
    }
}
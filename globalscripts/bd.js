/**
 * Unlike modern browsers, 0 A.D. does not have a debugger or
 * other advanced development tools. Debugging is done by inserting
 * logging functions into the suspected problematic code.
 * To simplify JavaScript debugging, this object adds some
 * commonly used logging methods.
 * Inspired by: Consul.js, log4javascript, js-logger and loglevel
 * https://www.adequatelygood.com/Consuljs-Simple-Logging-Abstraction.html
 * https://www.log4javascript.org/
 * https://github.com/jonnyreeves/js-logger
 * https://github.com/pimterry/loglevel
 */
const bd =
{
	/**
	 * Helper properties
	 */
	"_lastWarn": 0,
	"_timers": new Map(),

	/**
	 * Helper function to check if both arguments are Arrays
	 * @param   {any[]}  arrayA
	 * @param   {any[]}  arrayB
	 */
	doArrayCheck(arrayA, arrayB)
	{
		if (!Array.isArray(arrayA))
			return error("1st argument isn't an Array!");
		else if (!Array.isArray(arrayB))
			return error("2nd argument isn't an Array!");
		return true;
	},

	/**
	 * Helper function returns the current time in either milliseconds or microseconds, depending on the
	 * execution environment. IMPORTNAT: Simulation can't access "Engine.GetMicroseconds()"
	 * @example
	 * // If called within a simulation environment:
	 * getTimeBasedOnRegex(); // { value: 1633024187547, unit: "ms" }
	 *
	 * // If called outside a simulation environment:
	 * getTimeBasedOnRegex(); // { value: 1633024187547000, unit: "μs" }
	 *
	 * Alternative idea to the stack trace method: Just pass a boolean value getCurrentTime(isSimulation = false).
	*/
	getCurrentTime()
	{
		if (!/@simulation/.test(new Error("check").stack ?? ""))
			return {
				"value": Engine.GetMicroseconds(),
				"unit": "μs"
			};
		return {
			"value": Date.now(),
			"unit": "ms"
		};
	},

	/**
	 * Asserts that the specified object is true or evaluates to true. If this is the case, nothing is logged. If not, an error is logged.
	 * @param   {Object}  check
	 */
	assert(check)
	{
		return !check && error(uneval(`ASSERT FAIL: ${check}`));
	},

	// clear()
	// {
	//  // clear aynthing on the screen
	// 	// needs to be implemented in the .cpp part
	// }

	/**
	 * Visualize the beginning of a group of logging mesasges.
	 * @param   {string}  name
	 */
	group(name = "groupStart")
	{
		warn(`+++++ ${name} +++++`);
	},

	/**
	 * Visualize the end of a group of logging mesasges.
	 * @param   {string}  name
	 */
	groupEnd(name = "groupEnd")
	{
		warn(`----- ${name} -----\n`);
	},

	/**
	 * General logging method
	 * @param   {any[]}  data
	 */
	log(...data)
	{
		warn(uneval([...data]));
	},

	/**
	 * Get the intersecting values between two arrays. Venn diagram: A ∩ B, e.g. [1,2,3] and [3,4] is [3].
	 * @param  {any[]} arrayA
	 * @param  {any[]} arrayB
	 */
	inter(arrayA, arrayB)
	{
		if (this.doArrayCheck(arrayA, arrayB))
			warn(uneval(arrayA.filter(v => arrayB.includes(v))));
	},

	/**
	 * Recursively list all properties of the specified object until you get to the "Object.prototype" itself.
	 * The properties of Object.prototype are intentionally not included.
	 * @param   {Object} object
	 * @param   {any[]}  property
	 * @return  {any}  list of properties that can be called on that object
	 */
	listProp(object, property = [])
	{
		return object ? Object.getPrototypeOf(object) ?
			this.listProp(Object.getPrototypeOf(object), property.concat(Object.getOwnPropertyNames(object))) :
			warn(uneval([...new Set(property)].sort())) : warn(`${object} doesn't exist`);
	},

	/**
	 * Like "log", but the interval is every 2 seconds (useful in a loop).
	 * @param   {any[]}  data
	 */
	slow(...data)
	{
		if (Date.now() - this._lastWarn >= 2000)
		{
			this._lastWarn = Date.now();
			warn(uneval([...data]));
		}
	},

	/**
	 * Create a stack trace of the JavaScript call stack at the moment that the Error object was created.
	 */
	stack(task = "")
	{
		const { message, stack } = new Error(`Stack: ${task}`);
		if (task && typeof task === "string")
			warn(message);
		warn(stack ?? "no stack");
	},

	/**
	 * Returns the unique symmetric difference between two arrays that does not contain duplicate values from either array. Venn diagram: A ∆ B, e.g. [1,2,3] and [3,4] is [1,2,4].
	 * @param  {any[]} arrayA
	 * @param  {any[]} arrayB
	 */
	symDiff(arrayA, arrayB)
	{
		if (this.doArrayCheck(arrayA, arrayB))
			warn(uneval([...new Set([...arrayA.filter(v => !arrayB.includes(v)), ...arrayB.filter(v => !arrayA.includes(v))])]));
	},

	/**
	 * Transform the entity number into the template name
	 * @param   {Number}  entity
	 * @param   {string}  regExp
	 */
	temp(entity, regExp = "")
	{
		if (!/@simulation/.test(new Error("check").stack ?? ""))
			return error("This function is only callable inside a simulation");
		if (typeof entity !== "number")
			return warn(`${entity} is not a number`);
		const [template] = Engine.QueryInterface(SYSTEM_ENTITY, IID_TemplateManager).GetCurrentTemplateName(entity).split("/").reverse();
		if (!template)
			return warn(`no template found for ${entity}`);
		if (regExp)
			return new RegExp(regExp).test(template) ? warn(uneval([template, entity])) : "";
		return warn(uneval([template, entity]));
	},

	/**
	 * Start a timer with a name, it will not log anything, see "timeEnd".
	 * @param   {string}  name
	 */
	time(name = "conclusion")
	{
		this._timers.set(name, this.getCurrentTime());
	},

	/**
	 * The amount of time that has elapsed in milliseconds since the timer was started.
	 * @param   {string}  name
	 */
	timeEnd(name = "conclusion")
	{
		const { "value": start, "unit": startUnit } = this._timers.get(name) ?? {};
		const { "value": end, "unit": endUnit } = this.getCurrentTime();
		if (startUnit === endUnit)
			warn(`${name}: ${endUnit === "ms" ? end - start : (end - start) / 1000}ms`);
		else
			throw new Error("time units differ");
		this._timers.delete(name);
	},

	/**
	 * More precise checking of the type of a JavaScript object.
	 * @param  {Object} object
	 */
	trueTypeOf(object)
	{
		warn(Object.prototype.toString.call(object).slice(8, -1).toLowerCase());
	},

	/**
	 * Returns every element that exists in any of the two arrays once. Venn diagram: A ∪ B, e.g. [1,2,3] and [3,4] is [1,2,3,4].
	* @param  {any[]} arrayA
	* @param  {any[]} arrayB
	 */
	union(arrayA, arrayB)
	{
		if (this.doArrayCheck(arrayA, arrayB))
			warn(uneval([...new Set([...arrayA, ...arrayB])]));
	}
};

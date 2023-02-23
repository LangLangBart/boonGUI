/**
 * 0 A.D. does not have a debugger or any advanced developer tools as every modern browser.
 * Debugging is done by "hand" to ease the pain of JavaScript debugging this class
 * adds some often used logging methods.
 * Inspired by: Consul.js and log4javascript
 * https://www.adequatelygood.com/Consuljs-Simple-Logging-Abstraction.html
 * https://www.log4javascript.org/
 */
class Debug
{
	_lastWarn = 0;
	_timers = {};

	/**
	 * Helper function to check if both arguments are Arrays
	 * @param   {Array}  arrA
	 * @param   {Array}  arrB
	 */
	arrayCheck(arrA, arrB)
	{
		if(!Array.isArray(arrA))
			return warn("1st argument isn't an Array!");
		else if(!Array.isArray(arrB))
			return warn("2nd argument isn't an Array!");
		return true;
	}

	/**
	 * Asserts that the specified object is true or evaluates to true. If this is the case, nothing is logged. If not, an error is logged.
	 * @param   {Object}  check
	 * @return  {string}
	 */
	assert(check)
	{
		return !check && error(uneval(`ASSERT FAIL: ${check}`));
	}

	// clear()
	// {
	//  // clear aynthing on the screen
	// 	// needs to be implemented in the .cpp part
	// }

	/**
	 * Visualize the beginning of a group of logging mesasges.
	 * @param   {string}  name
	 */
	group(name = "groupStart") {
		warn(`+++++ ${name} +++++`);
	}

	/**
	 * Visualize the end of a group of logging mesasges.
	 * @param   {string}  name
	 */
	groupEnd(name = "groupEnd") {
		warn(`----- ${name} -----\n`);
	}

	/**
	 * General logging method
	 * @param   {Object}  args
	 * @return  {string}
	 */
	log(...args)
	{
		warn(uneval([...args]));
	}

	/**
	 * Object.hasOwn ships in SpiderMonkey 92 ...
	 * Short form for Object.prototype.hasOwnProperty.call(obj, prop).
	 * True if the given object has the given property defined directly. Otherwise false
	 * @param   {Object}  obj
	 * @param   {string}  prop
	 * @return  {Boolean}
	 */
	hasOwn(obj, prop)
	{
		warn(obj == null ? `${obj} doesn't exist` : obj.hasOwnProperty(prop));
	}

	/**
	 * Get the intersecting values between two arrays. Venn diagram: A ∩ B, e.g. [1,2,3] and [3,4] is [3].
	 * @param  {Array} arrA
	 * @param  {Array} arrB
	 * @return {Array}
	 */
	inter(arrA, arrB)
	{
		if(this.arrayCheck(arrA, arrB))
			warn(uneval(arrA.filter(v => arrB.includes(v))));
	}

	/**
	 * Recursively list all properties of the specified object until you get to the "Object.prototype" itself.
	 * The properties of Object.prototype are intentionally not included.
	 * @param   {Object} obj
	 * @param   {Array}  prop
	 * @return  {Array}
	 */
	listProp(obj, prop = [])
	{
		return obj == null ? warn(`${obj} doesn't exist`) : !Object.getPrototypeOf(obj) ?
			warn(uneval([...new Set(prop)].sort())) :
			this.listProp(Object.getPrototypeOf(obj), prop.concat(Object.getOwnPropertyNames(obj)));
	}

	/**
	 * Like "log", but the interval is every 2 seconds (useful in a loop).
	 * @param   {Object}  args
	 * @return  {string}
	 */
	slow(...args)
	{
		// IMPORTNAT: Simulation can't access "g_LastTickTime"
		if (Date.now() - this._lastWarn >= 2000)
		{
			this._lastWarn = Date.now();
			warn(uneval([...args]));
		}
	}

	/**
	 * Create a stack trace of the JavaScript call stack at the moment that the Error object was created.
	 * @return  {Error}
	 */
	stack(msg = "")
	{
		const error = new Error(`Stack: ${msg}`);
		if(msg && typeof msg === "string")
			warn(error.message);
		warn(error.stack);
	}

	/**
	 * Returns the unique symmetric difference between two arrays that does not contain duplicate values from either array. Venn diagram: A ∆ B, e.g. [1,2,3] and [3,4] is [1,2,4].
	 * @param  {Array} arrA
	 * @param  {Array} arrB
	 * @return {Array}
	 */
	symDiff(arrA, arrB)
	{
		if(this.arrayCheck(arrA, arrB))
			warn(uneval([...new Set([...arrA.filter(v => !arrB.includes(v)), ...arrB.filter(v => !arrA.includes(v))])]));
	}

	/**
	 * Transform the entity number into the template name
	 * @param   {Number}  entity
	 * @param   {RegExp}  regExp
	 * @return  {String}
	 */
	temp(entity, regExp = "")
	{
		if (typeof entity !== "number")
			return warn(`${entity} is not a number`);
		const [template] = Engine.QueryInterface(SYSTEM_ENTITY, IID_TemplateManager).GetCurrentTemplateName(entity).split("/").reverse();
		if(!template)
			return warn(`no template found for ${entity}`);
		if (regExp)
			return regExp.test(template) ? warn(uneval([template, entity])) : "";
		return warn(uneval([template, entity]));
	}

	/**
	 * Start a timer with a name, it will not log anything, see "timeEnd".
	 * @param   {string}  name
	 * @return  {Object}
	 */
	time(name = "conclusion")
	{
		// IMPORTNAT: Simulation can't access "Engine.GetMicroseconds()"
		this._timers[name] = { "start": Date.now() };
	}

	/**
	 * The amount of time that has elapsed in milliseconds since the timer was started.
	 * @param   {string}  name
	 * @return  {string}
	 */
	timeEnd(name = "conclusion")
	{
		// IMPORTNAT: Simulation can't access "Engine.GetMicroseconds()"
		const end = Date.now();
		warn(`${name}: ${end - this._timers[name].start}ms`);
		this._timers[name].end = end;
		delete this._timers[name];
	}

	/**
	 * More precise checking of the type of a JavaScript object.
	 * @param  {Object} obj
	 * @return {string}
	 */
	trueTypeOf(obj)
	{
		warn(Object.prototype.toString.call(obj).slice(8, -1).toLowerCase());
	}

	/**
	 * Returns every element that exists in any of the two arrays once. Venn diagram: A ∪ B, e.g. [1,2,3] and [3,4] is [1,2,3,4].
	* @param  {Array} arrA
	* @param  {Array} arrB
	* @return {Array}
	 */
	union(arrA, arrB)
	{
		if(this.arrayCheck(arrA, arrB))
			warn(uneval(Array.from(new Set([...arrA, ...arrB]))));
	}
}

const d = new Debug();
Engine.RegisterGlobal("d", d);

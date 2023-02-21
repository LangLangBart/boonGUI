/**
 * @param {Object} [prefix]
 * @param {String} method
 * @param {Function} patch
 */
function autociv_patchApplyN()
{
	if (arguments.length < 2)
	{
		const error = new Error(`Insufficient arguments to patch: ${arguments[0]}`);
		warn(error.message);
		warn(error.stack);
		return;
	}

	let prefix, method, patch;
	if (arguments.length == 2)
	{
		prefix = global;
		method = arguments[0];
		patch = arguments[1];
	}
	else
	{
		prefix = arguments[0];
		method = arguments[1];
		patch = arguments[2];
	}

	if (!(method in prefix))
	{
		const error = new Error(`Function not defined: ${method}`);
		warn(error.message);
		warn(error.stack);
		return;
	}

	prefix[method] = new Proxy(prefix[method], { "apply": patch });
}
// register global fuctions for the GUI
global.debug = (...args) => warn(uneval([...args]));
global.g_boonGUI_LastWarn = 0;
global.debug.slow = (...args) => {
	if (g_LastTickTime - g_boonGUI_LastWarn >= 2000)
	{
		g_boonGUI_LastWarn = g_LastTickTime;
		warn(uneval([...args]));
	}
};
global.stack = () => warn(new Error().stack);
global.trueTypeOf = obj => warn(Object.prototype.toString.call(obj).slice(8, -1).toLowerCase());
global.listProperty = (obj, prop = []) => obj == null ? warn(`${obj} doesn't exist`) : !Object.getPrototypeOf(obj) ?
	debug(...[...new Set(prop)].sort()) :
	listProperty(Object.getPrototypeOf(obj), prop.concat(Object.getOwnPropertyNames(obj)));
// Object.hasOwn is shipping in Firefox 92, till then ...
global.hasOwn = (obj, prop) => obj == null ? warn(`${obj} doesn't exist`) : warn(obj.hasOwnProperty(prop));
global.timeTaken = (callback, count = 1) => {
	const measure = [];
	for (let i = 0; i < count; i++)
	{
		const startTime = Engine.GetMicroseconds();
		callback();
		measure.push(Engine.GetMicroseconds() - startTime);
	}
	const average = measure.reduce((acc, val) => acc + val, 0) / count;
	warn(`${(average / 1000).toFixed(5)}ms ${count > 1 ? measure : ""}`);
};

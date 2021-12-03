/**
 * @param {Object} [prefix]
 * @param {String} method
 * @param {Function} patch
 */
function autociv_patchApplyN()
{
	if (arguments.length < 2)
	{
		const error = new Error("Insufficient arguments to patch: " + arguments[0]);
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
		const error = new Error("Function not defined: " + method);
		warn(error.message);
		warn(error.stack);
		return;
	}

	prefix[method] = new Proxy(prefix[method], { "apply": patch });
}

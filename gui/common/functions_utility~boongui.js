/**
 * Manage acoustic GUI notifications.
 *
 * @param {string} type - Notification type.
 */
function soundNotification(type)
{
	if (Engine.ConfigDB_GetValue("user", "sound.notify." + type) != "true")
		return;
	Engine.PlayUISound(g_SoundNotifications[type].soundfile, false);
}

/**
 * Vertically spaces objects within a parent
 *
 * @param margin The gap, in px, between the objects
 */
function verticallySpaceObjects(parentName, margin = 0)
{
	const objects = Engine.GetGUIObjectByName(parentName).children;
	for (let i = 0; i < objects.length; ++i)
	{
		const size = objects[i].size;
		const height = size.top - size.bottom;
		size.bottom = i * (height + margin) + margin;
		size.top = i * (height + margin);
		objects[i].size = size;
	}
}

function brightenedColor(color)
{
	const threshold = 255.999;

	let amount = 0;
	let r = color.r * 255;
	let g = color.g * 255;
	let b = color.b * 255;
	let m = Math.max(r, g, b);

	if (m < 150)
	{
		amount = 100;
	}
	else if (m < 170 || b == 200)
	{ // red purple
		amount = 70;
	}

	r += amount;
	g += amount;
	b += amount;
	m = Math.max(r, g, b);

	if (m > threshold)
	{
		const total = r + g + b;
		if (total >= 3 * threshold)
		{
			r = g = b = threshold;
		}
		else
		{
			const x = (3 * threshold - total) / (3 * m - total);
			const gray = threshold - x * m;
			r = gray + x * r;
			g = gray + x * g;
			b = gray + x * b;
		}
	}

	return `${Math.floor(r)} ${Math.floor(g)} ${Math.floor(b)}`;
}

function setCameraFollowFPS(entity)
{
	const entState = entity && GetEntityState(entity);
	if (entState && hasClass(entState, "Unit"))
		Engine.CameraFollowFPS(entity);
	else
		Engine.CameraFollowFPS(0);
}

function quitConfirmation()
{
	for (const name in QuitConfirmationMenu.prototype)
	{
		const quitConfirmationCheck = new QuitConfirmationMenu.prototype[name]();
		if (quitConfirmationCheck.enabled())
			quitConfirmationCheck.display();
	}
	return true;
}

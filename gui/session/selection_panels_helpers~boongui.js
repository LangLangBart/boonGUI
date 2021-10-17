function setCameraFollowFPS(entity)
{
	let entState = entity && GetEntityState(entity);
	if (entState && hasClass(entState, "Unit"))
		Engine.CameraFollowFPS(entity);
	else
		Engine.CameraFollowFPS(0);
}

function quitConfirmation()
{
		for (let name in QuitConfirmationMenu.prototype)
		{
			let quitConfirmation = new QuitConfirmationMenu.prototype[name]();
			if (quitConfirmation.enabled())
				quitConfirmation.display();
		}
		return true;
}

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

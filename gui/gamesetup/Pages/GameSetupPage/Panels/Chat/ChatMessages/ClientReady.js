ChatMessageEvents.ClientReady = class
{
	constructor(setupWindow, chatMessagesPanel)
	{
		this.chatMessagesPanel = chatMessagesPanel;

		this.args = {};

		setupWindow.controls.netMessages.registerNetMessageHandler("ready", this.onReadyMessage.bind(this));
	}

	onReadyMessage(message)
	{
		const playerAssignment = g_PlayerAssignments[message.guid];
		if (!playerAssignment || playerAssignment.player == -1)
			return;

		const text = this.ReadyMessage[message.status] || undefined;
		if (!text)
			return;

		this.args.username = colorizePlayernameByGUID(message.guid);
		this.chatMessagesPanel.addText(setStringTags(sprintf(text, this.args), this.MessageTags));
	}
};

ChatMessageEvents.ClientReady.prototype.ReadyMessage = [
	translate("--- %(username)s is not ready."),
	translate("+++ %(username)s is ready!")
];

ChatMessageEvents.ClientReady.prototype.MessageTags = {
	"font": "sans-stroke-14"
};

ChatMessageEvents.ClientReady.prototype.ReadyMessage = [
	translate("* %(username)s is not ready.").replace(/^\*/, "---"),
	translate("* %(username)s is ready!").replace(/^\*/, "+++")
];
ChatMessageEvents.ClientReady.prototype.MessageTags = {
	"font": "sans-stroke-14"
};

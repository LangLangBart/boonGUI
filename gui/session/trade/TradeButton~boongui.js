/**
 * BoonGUITradeButtonManager class modifies the "constructor" and the "setTradingGoods()" method
 * of the TradeButtonManager class, allowing to remember the last trading probabilities for
 * each resource and update if they change.
 */
class BoonGUITradeButtonManager extends TradeButtonManager {
	constructor()
	{
		super();
		this.userDefinedPropb = Engine.ConfigDB_GetValue("user", "boongui.session.trade.probability").split(",");
		// Check if the sum of the numbers is 100% and the number of elements is equal to the number of resources.
		if (controlsPlayer(g_ViewedPlayer) && this.userDefinedPropb.reduce((acc, val) => +acc + +val, 0) === 100 && Object.values(this.tradingGoods).length === this.userDefinedPropb.length)
		{
			for (const resCode in this.tradingGoods)
				this.tradingGoods[resCode] = +this.userDefinedPropb.shift();
			this.setTradingGoods();
		}
	}

	setTradingGoods()
	{
		// save the probability values as string, for example: "0,25,25,50"
		Engine.ConfigDB_CreateAndWriteValueToFile("user", "boongui.session.trade.probability", Object.values(this.tradingGoods).toString(), "config/user.cfg");
		Engine.PostNetworkCommand({
			"type": "set-trading-goods",
			"tradingGoods": this.tradingGoods
		});
	}
}

TradeButtonManager = BoonGUITradeButtonManager;

function int(num){
	return num;
}

exports.buy_in = async (swc, g)=>{
	let market = g.market
	let temp_C = int(g.AMOUNT_PER_BUY / g.price.buy[market.C]);
	let temp_A = int(temp_C * 0.998 / g.price.buy[market.B]);
	let temp_usdt = int(temp_A * 0.998 * g.price.sell[market.A]);
	let order = [{
		"amount" : temp_C,
		"price" : g.price.buy[market.C],
		"type" : "buy-limit",
		"symbol" : market.C,
	},{
		"amount" : temp_A,
		"price" : g.price.buy[market.B],
		"type" : "buy-limit",
		"symbol" : market.B,
	},{
		"amount" : temp_A * 0.998,
		"price" : g.price.sell[market.A],
		"type" : "sell-limit",
		"symbol" : market.A,
	}];
	// swc.huobi.controller.trangle.log(swc, JSON.stringify(g), 'trade');
	let order_ids;
	try{
		order_ids = await swc.huobi.trade.order_place(swc, order);
		let msg = JSON.stringify(order) + "\n" + 
			"in_dif_val:" + g.in_dif_val + "\n" +
			"out_dif_val:" + g.out_dif_val + "\n" + 
			"market : " + JSON.stringify(g.price) + "\n" + 
			"orderids : " + order_ids.join(',') + "\n";
		swc.huobi.controller.trangle.log(swc, msg, 'trade');
		return order_ids;
	}catch(e){
		throw e;
	}
}

exports.sell_out = async (swc, g)=>{
	let market = g.market;
	let temp_A = int(g.AMOUNT_PER_BUY / g.price.buy[market.A]);
	let temp_C = int(temp_A * 0.998 * g.price.sell[market.B]);
	let temp_usdt = int(temp_C * 0.998 * g.price.sell[market.C]);
	let order = [{
		"amount" : temp_A,
		"price" : g.price.buy[market.A],
		"type" : "buy-limit",
		"symbol" : market.A,
	},{
		"amount" : temp_A * 0.998,
		"price" : g.price.sell[market.B],
		"type" : "sell-limit",
		"symbol" : market.B,
	},{
		"amount" : temp_C * 0.998,
		"price" : g.price.sell[market.C],
		"type" : "sell-limit",
		"symbol" : market.C,
	}];
	// swc.huobi.controller.trangle.log(swc, JSON.stringify(g), 'trade');
	let order_ids;
	try{
		order_ids = await swc.huobi.trade.order_place(swc, order);
		let msg = JSON.stringify({order}) + "\n" +
			"in_dif_val:" + g.in_dif_val + "\n" +
			"out_dif_val:" + g.out_dif_val + "\n" + 
			"market : " + JSON.stringify(g.price) + "\n" + 
			"orderids : " + order_ids.join(',') + "\n";
			swc.huobi.controller.trangle.log(swc, msg, 'trade');

		return order_ids;
	}catch(e){
		throw e;
	}
}
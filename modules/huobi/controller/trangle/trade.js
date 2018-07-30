function int(num){
	return num;
}

exports.buy_in = async (swc, g)=>{
	let market = g.market
	let temp_C = int(g.AMOUNT_PER_BUY / g.price.buy[market.C]);
	let temp_A = int(temp_C * 0.998 / g.price.buy[market.B]);
	let temp_usdt = int(temp_A * 0.998 * g.price.sell[market.A]);
	//order : 
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
	}catch(e){
		throw e;
	}

	let msg = "buy:" + temp_C + " C when "+market.C+"=" + g.price.buy[market.C] + "\n" +
		"buy:" + temp_A + " B when "+market.B+"=" + g.price.buy[market.B] + "\n" + 
		"sell:" + temp_usdt + " A when "+market.A+"=" + g.price.sell[market.A] + "\n" + 
		"in_dif_val:" + g.in_dif_val + "\n" +
		"out_dif_val:" + g.out_dif_val + "\n" + 
		"market : " + JSON.stringify(g.price) + "\n" + 
		"orderids : " + order_ids.join(',') + "\n";
	swc.huobi.controller.trangle.log(swc, msg, 'trade');
	return order_ids;
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
	}catch(e){
		throw e;
	}

	let msg = "buy:" + temp_A + " A when "+market.A+"=" + g.price.buy[market.A] + "\n" +
	"sell:" + temp_C + " B when "+market.B+"=" + g.price.sell[market.B] + "\n" + 
	"sell:" + temp_usdt + " C when "+market.C+"=" + g.price.sell[market.C] + "\n" + 
	"in_dif_val:" + g.in_dif_val + "\n" +
	"out_dif_val:" + g.out_dif_val + "\n" + 
	"market : " + JSON.stringify(g.price) + "\n" + 
	"orderids : " + order_ids.join(',') + "\n";
	swc.huobi.controller.trangle.log(swc, msg, 'trade');

	return order_ids;
}
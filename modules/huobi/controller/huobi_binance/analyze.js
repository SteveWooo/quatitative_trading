const DEPTH = {
	eth : "0.3"
}

function get_price (swc, g){
	var price = {
		huobi : {
			buy_price : 0,
			sell_price : 0
		},
		binance : {
			buy_price : 0,
			sell_price : 0
		}
	}

	//huobi出售价格
	var depth = 0;
	for(var i=0;i<g.depths.huobi.bids.length;i++){
		depth += g.depths.huobi.bids[i][1];
		if(depth >= DEPTH[g.market]){
			price.huobi.sell_price = g.depths.huobi.bids[i][0];
			break;
		}
	}

	//huobi购买价格
	depth = 0;
	for(var i=0;i<g.depths.huobi.asks.length;i++){
		depth += g.depths.huobi.asks[i][1];
		if(depth >= DEPTH[g.market]){
			price.huobi.buy_price = g.depths.huobi.asks[i][0];
			break;
		}
	}

	//binance出售价格
	depth = 0;
	for(var i=0;i<g.depths.binance.bids.length;i++){
		depth += g.depths.binance.bids[i][1];
		if(depth >= DEPTH[g.market]){
			price.binance.sell_price = g.depths.binance.bids[i][0];
			break;
		}
	}

	//binance购买价格
	depth = 0;
	for(var i=0;i<g.depths.binance.asks.length;i++){
		depth += g.depths.binance.asks[i][1];
		if(depth >= DEPTH[g.market]){
			price.binance.buy_price = g.depths.binance.asks[i][0];
			break;
		}
	}

	if(price.huobi.buy_price == 0 ||
		price.huobi.sell_price == 0 ||
		price.binance.buy_price == 0 ||
		price.binance.sell_price == 0){
		throw{
			message : "analyze price error",
			price : price
		}
	}

	return price
}

function check_buy(swc, g){
	let check = {
		buy_huobi : 0,
		buy_binance : 0
	}

	check.buy_huobi = g.AMOUNT_PER_BUY * 0.998 * g.price.binance.sell_price * 0.999
		- g.AMOUNT_PER_BUY * g.price.huobi.buy_price

	check.buy_binance = g.AMOUNT_PER_BUY * 0.999 * g.price.huobi.sell_price * 0.998
		- g.AMOUNT_PER_BUY * g.price.binance.buy_price;

	return check;
}

module.exports = (swc, g)=>{
	try{
		let price = get_price(swc, g);
		g.price = price;
		let check = check_buy(swc, g);

		return {
			price : price,
			check : check
		}
	}catch(e){
		throw e;
	}
}
const DEPTH = {
	'dtabtc' : 1500,
	'dtausdt' : 1500,
	'ocnusdt' : 6000,
	'ocnbtc' : 6000,
	'btcusdt' : 0.006,
	'ethbtc' : 0.02,
	'ethusdt' : 0.6,
}

function get_avg(swc, list, m){
	let depth = 0;
	for(var i=0;i<list.length;i++){
		depth += list[i][1]; //TODO 用成本作为深度对照
		if(depth >= DEPTH[m]){
			return list[i][0];
		}
	}
	return list[0][0];
}

function analyze_price(swc, g){
	let price = g.market_price;
	let market = g.market;
	let p = {
		buy : {},
		sell : {}
	}

	let temp = {
		buy : {},
		sell : {}
	}

	//直接出的市价交易：
	for(var m in market){
		if(m.toUpperCase() != m){
			continue;
		}
		temp.buy[market[m]] = get_avg(swc, price[market[m]].asks, market[m]);
		temp.sell[market[m]] = get_avg(swc, price[market[m]].bids, market[m]);
	}

	// return temp;
	//计算价格
	for(var m in market){
		if(m.toUpperCase() != m){
			continue;
		}
		//偏快走单的价格
		// p.buy[market[m]] = (temp.buy[market[m]] + ((temp.buy[market[m]] + temp.sell[market[m]]) / 2)) / 2;
		// p.buy[market[m]] = 1/2 * temp.buy[market[m]] + 1/2 * temp.sell[market[m]];
		// p.sell[market[m]] = temp.sell[market[m]];
		// p.buy[market[m]] = temp.sell[market[m]];

		// p.sell[market[m]] = (temp.sell[market[m]] + ((temp.buy[market[m]] + temp.sell[market[m]]) / 2)) / 2;
		// p.sell[market[m]] = 3/4 * temp.sell[market[m]] + 1/4 * temp.buy[market[m]];
		//SELL_FIRST , BUY_FIRST , AVG
		if(g.buy_mode == "SELL_FIRST"){
			p.buy[market[m]] = 1/2 * temp.buy[market[m]] + 1/2 * temp.sell[market[m]];
			p.sell[market[m]] = temp.sell[market[m]];
		}
		if(g.buy_mode == "BUY_FIRST"){
			p.buy[market[m]] = temp.buy[market[m]]
			p.sell[market[m]] = 1/2 * temp.buy[market[m]] + 1/2 * temp.sell[market[m]];
		}
		if(g.buy_mode == "AVG"){
			p.sell[market[m]] = p.buy[market[m]] = 1/2 * temp.buy[market[m]] + 1/2 * temp.sell[market[m]];
		}
		if(g.buy_mode == "GO_FIRST"){
			p.sell[market[m]] = temp.sell[market[m]];
			p.buy[market[m]] = temp.buy[market[m]];
		}
		if(g.buy_mode == "MAX_DIF"){
			p.sell[market[m]] = temp.buy[market[m]];
			p.buy[market[m]] = temp.sell[market[m]];
		}

		if(p.sell[market[m]] == undefined || 
			p.buy[market[m]] == undefined){
			throw {
				code : 5000,
				message : "buy mode error"
			}
		}

		//中间价格
		// p.sell[market[m]] = p.buy[market[m]] = (temp.buy[market[m]] + temp.sell[market[m]]) / 2;
	}
	return p;
}

let analyse = (swc, g)=>{
	let result;
	let market = g.market;
	let AMOUNT_PER_BUY = g.AMOUNT_PER_BUY;
	result = {
		market : market,
		price : analyze_price(swc, g),
	};

	//买入公允
	result.in_dif_val = (( (((AMOUNT_PER_BUY / result.price.buy[market.C]) * 0.998 ) /  result.price.buy[market.B])) * 0.998 * result.price.sell[market.A]) 
		* 0.998
		- AMOUNT_PER_BUY;

	//卖出公允
	result.out_dif_val = ((AMOUNT_PER_BUY / result.price.buy[market.A]) * 0.998 * result.price.sell[market.B] * 0.998 * result.price.sell[market.C]) 
		* 0.998
		- AMOUNT_PER_BUY;

	return result;
}

module.exports = async (swc, g)=>{
	try{
		return analyse(swc, g);
	}catch(e){
		throw e;
	}
}
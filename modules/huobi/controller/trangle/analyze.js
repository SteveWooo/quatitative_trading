const DEPTH = {
	'dtabtc' : 1500,
	'dtausdt' : 1500,
	'ocnusdt' : 5000,
	'ocnbtc' : 5000,
	'btcusdt' : 0.01
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
		p.buy[market[m]] = 2/4 * temp.buy[market[m]] + 2/4 * temp.sell[market[m]];
		// p.sell[market[m]] = (temp.sell[market[m]] + ((temp.buy[market[m]] + temp.sell[market[m]]) / 2)) / 2;
		// p.sell[market[m]] = 3/4 * temp.sell[market[m]] + 1/4 * temp.buy[market[m]];
		p.sell[market[m]] = temp.sell[market[m]];

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
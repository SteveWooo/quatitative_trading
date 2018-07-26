const AMOUNT_PER_BUY = 19;//usdt
const ANALYZE_DEPTH = 10;
var MK;
var A;
var B;
var C;
const fs = require('fs');
async function getPrices(swc){
	let data;
	let price = {};
	try{
		// data = await swc.huobi.depth(swc, 'ethusdt', 'step0');
		// price.ethusdt = {
		// 	buy : data.bids,
		// 	sell : data.asks
		// }
		// data = await swc.huobi.depth(swc, 'btcusdt', 'step0');
		// price.btcusdt = {
		// 	buy : data.bids,
		// 	sell : data.asks
		// }
		// data = await swc.huobi.depth(swc, 'ethbtc', 'step0');
		// price.ethbtc = {
		// 	buy : data.bids,
		// 	sell : data.asks
		// }
		data = await swc.huobi.depth(swc, A, 'step0');
		price[A] = {
			buy : data.bids,
			sell : data.asks
		}
		data = await swc.huobi.depth(swc, C, 'step0');
		price[C] = {
			buy : data.bids,
			sell : data.asks
		}
		data = await swc.huobi.depth(swc, B, 'step0');
		price[B] = {
			buy : data.bids,
			sell : data.asks
		}
	}catch(e){
		return {
			code : 4000
		}
	}

	return {
		code : 2000,
		price : price
	};
}

/*

opt = {
	buy : [{
		in : "xx",
		out : 'xx',
		market : 'xxx_xxx',
		amount : xx
	}],
	sell : [{
		in : "xx",
		out : 'xx',
		market : 'xxx',
		amount : xx
	}]
}

*/
function log(data){
	fs.appendFileSync('./log', data + "\n");
}

function trade_sell(swc, opt, price){
	let charge = int(0.002 * opt.amount);
	// charge = 0;
	global.swc.huobi.balance[opt.in] += int(opt.amount - charge);
	global.swc.huobi.balance[opt.out] -= int(opt.amount / price);
}
function trade_buy(swc, opt, price){
	let charge = int(0.002 * opt.amount);
	// charge = 0;
	global.swc.huobi.balance[opt.in] += int(opt.amount - charge);
	global.swc.huobi.balance[opt.out] -= int(opt.amount * price);
}

async function buy_in(swc, result){
	// let temp_btc = int(AMOUNT_PER_BUY / result.price.buy['btcusdt']);
	// let temp_eth = int(temp_btc * 0.998 / result.price.buy['ethbtc']);
	// let temp_usdt = int(temp_eth * 0.998 * result.price.sell['ethusdt']);
	let temp_btc = int(AMOUNT_PER_BUY / result.price.buy[C]);
	let temp_eth = int(temp_btc * 0.998 / result.price.buy[B]);
	let temp_usdt = int(temp_eth * 0.998 * result.price.sell[A]);
	//买BTC\USDT
	// trade_buy(swc, {
	// 	market : 'btcusdt',
	// 	in : 'btc',
	// 	out : 'usdt',
	// 	amount : temp_btc
	// }, result.price.buy['btcusdt'] + 0.01);
	// //买ETH\BTC
	// trade_buy(swc, {
	// 	market : 'ethbtc',
	// 	in : 'eth',
	// 	out : 'btc',
	// 	amount : temp_eth
	// }, result.price.buy['ethbtc']);
	// //卖出ETH/USDT
	// trade_sell(swc, {
	// 	market : 'ethusdt',
	// 	in : 'usdt',
	// 	out : 'eth',
	// 	amount : temp_usdt
	// }, result.price.sell['ethusdt'] - 0.01);

	let msg = "buy:" + temp_btc + " C when "+C+"=" + result.price.buy[C] + "\n" +
		"buy:" + temp_eth + " B when "+B+"=" + result.price.buy[B] + "\n" + 
		"sell:" + temp_usdt + " A when "+A+"=" + result.price.sell[A] + "\n" + 
		"===========================================================";

	log(msg);
	//order : 
	// let order_ids = await swc.huobi.trade.order_place(swc, [{
	// 	"amount" : temp_btc,
	// 	"price" : result.price.buy['btcusdt'],
	// 	"type" : "buy-limit",
	// 	"symbol" : "btcusdt",
	// },{
	// 	"amount" : temp_eth,
	// 	"price" : result.price.buy['ethbtc'],
	// 	"type" : "buy-limit",
	// 	"symbol" : "ethbtc",
	// },{
	// 	"amount" : temp_eth * 0.998,
	// 	"price" : result.price.sell['ethusdt'],
	// 	"type" : "sell-limit",
	// 	"symbol" : "ethusdt",
	// }]);
	let order = [{
		"amount" : temp_btc,
		"price" : result.price.buy[C],
		"type" : "buy-limit",
		"symbol" : C,
	},{
		"amount" : temp_eth,
		"price" : result.price.buy[B],
		"type" : "buy-limit",
		"symbol" : B,
	},{
		"amount" : temp_eth * 0.998,
		"price" : result.price.sell[A],
		"type" : "sell-limit",
		"symbol" : A,
	}];
	let order_ids = await swc.huobi.trade.order_place(swc, order);

	if(typeof order_ids == typeof []){
		let local_order = fs.readFileSync('./modules/huobi/trades/trade').toString();
		local_order = JSON.parse(local_order);
		local_order.push(order);
		fs.writeFileSync('./modules/huobi/trades/trade', JSON.stringify(local_order));
	}
	return order_ids;
}

async function buy_out(swc, result){
	// let temp_eth = int(AMOUNT_PER_BUY / result.price.buy['ethusdt']);
	// let temp_btc = int(temp_eth * 0.998 * result.price.sell['ethbtc']);
	// let temp_usdt = int(temp_btc * 0.998 * result.price.sell['btcusdt']);
	let temp_eth = int(AMOUNT_PER_BUY / result.price.buy[A]);
	let temp_btc = int(temp_eth * 0.998 * result.price.sell[B]);
	let temp_usdt = int(temp_btc * 0.998 * result.price.sell[C]);
	//买ETH/USDT
	// trade_buy(swc, {
	// 	market : 'ethusdt',
	// 	in : 'eth',
	// 	out : 'usdt',
	// 	amount : temp_eth
	// }, result.price.buy['ethusdt']);
	// //卖ETH\BTC
	// trade_sell(swc, {
	// 	market : 'ethbtc',
	// 	in : 'btc',
	// 	out : 'eth',
	// 	amount : temp_btc
	// }, result.price.sell['ethbtc']);
	// //卖BTC\USDT
	// trade_sell(swc, {
	// 	market : 'btcusdt',
	// 	in : 'usdt',
	// 	out : 'btc',
	// 	amount : temp_usdt
	// }, result.price.sell['btcusdt'] - 0.01);

	let msg = "buy:" + temp_eth + " A when "+A+"=" + result.price.buy[A] + "\n" +
		"sell:" + temp_btc + " B when "+B+"=" + result.price.buy[B] + "\n" + 
		"sell:" + temp_usdt + " C when "+C+"=" + result.price.sell[C] + "\n" + 
		"===========================================================";

	log(msg);

	// let order_ids = await swc.huobi.trade.order_place(swc, [{
	// 	"amount" : temp_eth,
	// 	"price" : result.price.buy['ethusdt'],
	// 	"type" : "buy-limit",
	// 	"symbol" : "ethusdt",
	// },{
	// 	"amount" : temp_eth * 0.998,
	// 	"price" : result.price.sell['ethbtc'],
	// 	"type" : "sell-limit",
	// 	"symbol" : "ethbtc",
	// },{
	// 	"amount" : temp_btc * 0.998,
	// 	"price" : result.price.sell['btcusdt'],
	// 	"type" : "sell-limit",
	// 	"symbol" : "btcusdt",
	// }]);
	let oreder = [{
		"amount" : temp_eth,
		"price" : result.price.buy[A],
		"type" : "buy-limit",
		"symbol" : A,
	},{
		"amount" : temp_eth * 0.998,
		"price" : result.price.sell[B],
		"type" : "sell-limit",
		"symbol" : B,
	},{
		"amount" : temp_btc * 0.998,
		"price" : result.price.sell[C],
		"type" : "sell-limit",
		"symbol" : C,
	}]
	let order_ids = await swc.huobi.trade.order_place(swc, order);

	if(typeof order_ids == typeof []){
		let local_order = fs.readFileSync('./modules/huobi/trades/trade').toString();
		local_order = JSON.parse(local_order);
		local_order.push(order);
		fs.writeFileSync('./modules/huobi/trades/trade', JSON.stringify(local_order));
	}

	return order_ids;
}

function int(num){
	// return Math.floor(num * 1000000) / 1000000;
	return num
}

function get_avg(swc, list){
	let all_price = 0;
	let depth = 0;
	for(var i=0;i<list.length;i++){
		all_price += list[i][0] * list[i][1];
		depth += list[i][1];
		if(depth >= ANALYZE_DEPTH){
			return list[i][0];
			// return all_price / depth;
		}
	}

	// return all_price / depth;
	return list[0][0];
}

function analyze_price(swc, price){
	// let p = {
	// 	buy : {
	// 		ethusdt : get_avg(swc, price.ethusdt.buy),
	// 		ethbtc : get_avg(swc, price.ethbtc.buy),
	// 		btcusdt : get_avg(swc, price.btcusdt.buy)
	// 	},
	// 	sell : {
	// 		ethusdt : get_avg(swc, price.ethusdt.sell),
	// 		ethbtc : get_avg(swc, price.ethbtc.sell),
	// 		btcusdt : get_avg(swc, price.btcusdt.sell)
	// 	}
	// }
	let p = {
		buy : {},
		sell : {}
	}
	p.buy[A] = get_avg(swc, price[A].buy);
	p.buy[B] = get_avg(swc, price[B].buy);
	p.buy[C] = get_avg(swc, price[C].buy);

	p.sell[A] = get_avg(swc, price[A].sell);
	p.sell[B] = get_avg(swc, price[B].sell);
	p.sell[C] = get_avg(swc, price[C].sell);

	return p;
}

function check_balance_in(swc, price){
	// let need_usdt = AMOUNT_PER_BUY;
	// let need_btc = (AMOUNT_PER_BUY / price.buy['btcusdt']) * 0.998;
	// let need_eth = (need_btc / price.buy['ethbtc']) * 0.998;
	// if(global.swc.huobi.balance.usdt < need_usdt ||
	// 	global.swc.huobi.balance.btc < need_btc ||
	// 	global.swc.huobi.balance.eth < need_eth){
	// 	return false;
	// }
	let need_usdt = AMOUNT_PER_BUY;
	let need_btc = (AMOUNT_PER_BUY / price.buy[C]) * 0.998;
	let need_eth = (need_btc / price.buy[B]) * 0.998;
	if(global.swc.huobi.balance.usdt < need_usdt ||
		global.swc.huobi.balance.btc < need_btc ||
		global.swc.huobi.balance.eth < need_eth){
		return false;
	}
	
	return true;
}

function check_balance_out(swc, price){
	// let need_usdt = AMOUNT_PER_BUY;
	// let need_eth = (AMOUNT_PER_BUY / price.buy['ethusdt']) * 0.998;
	// let need_btc = (need_eth * price.sell['ethbtc']) * 0.998;
	// if(global.swc.huobi.balance.usdt < need_usdt ||
	// 	global.swc.huobi.balance.btc < need_btc ||
	// 	global.swc.huobi.balance.eth < need_eth){
	// 	return false;
	// }
	let need_usdt = AMOUNT_PER_BUY;
	let need_eth = (AMOUNT_PER_BUY / price.buy[A]) * 0.998;
	let need_btc = (need_eth * price.sell[B]) * 0.998;
	if(global.swc.huobi.balance.usdt < need_usdt ||
		global.swc.huobi.balance.btc < need_btc ||
		global.swc.huobi.balance.eth < need_eth){
		return false;
	}
	
	return true;
}

async function analyze(swc, price){
	// let result = {
	// 	market_price : {
	// 		buy : {
	// 			ethusdt : price.ethusdt.sell[0],
	// 			ethbtc : price.ethbtc.sell[0],
	// 			btcusdt : price.btcusdt.sell[0],
	// 		},
	// 		sell : {
	// 			ethusdt : price.ethusdt.buy[0],
	// 			ethbtc : price.ethbtc.buy[0],
	// 			btcusdt : price.btcusdt.buy[0],
	// 		}
	// 	},
	// 	price : analyze_price(swc, price)
	// };
	let result = {
		market_price : {
			buy : {},
			sell : {}
		},
		price : analyze_price(swc, price)
	};

	result.market_price.buy[A] = price[A].sell[0];
	result.market_price.buy[B] = price[B].sell[0];
	result.market_price.buy[C] = price[C].sell[0];

	result.market_price.sell[A] = price[A].buy[0];
	result.market_price.sell[B] = price[B].buy[0];
	result.market_price.sell[C] = price[C].buy[0];

	// //买入公允
	// result.in_dif_val = (( (((AMOUNT_PER_BUY / result.price.buy['btcusdt']) * 0.998 ) /  result.price.buy['ethbtc'])) * 0.998 * result.price.sell['ethusdt']) 
	// 	* 0.998
	// 	- AMOUNT_PER_BUY;

	// //卖出公允
	// result.out_dif_val = ((AMOUNT_PER_BUY / result.price.buy['ethusdt']) * 0.998 * result.price.sell['ethbtc'] * 0.998 * result.price.sell['btcusdt']) 
	// 	* 0.998
	// 	- AMOUNT_PER_BUY;

		//买入公允
	result.in_dif_val = (( (((AMOUNT_PER_BUY / result.price.buy[C]) * 0.998 ) /  result.price.buy[B])) * 0.998 * result.price.sell[A]) 
		* 0.998
		- AMOUNT_PER_BUY;

	//卖出公允
	result.out_dif_val = ((AMOUNT_PER_BUY / result.price.buy[A]) * 0.998 * result.price.sell[B] * 0.998 * result.price.sell[C]) 
		* 0.998
		- AMOUNT_PER_BUY;

	console.log({
		in_dif_val : result.in_dif_val,
		out_dif_val : result.out_dif_val
	});
	if(result.in_dif_val > 0 && check_balance_in(swc, result.price)){
		// global.swc.huobi.status = false;
		await buy_in(swc, result);
		process.stdout.write('\x07');
	}

	if(result.out_dif_val > 0 && check_balance_out(swc, result.price)){
		// global.swc.huobi.status = false;
		await buy_out(swc, result);
		process.stdout.write('\x07');
	}

	return result;
}

async function run(swc){
	try{
		//获取市场交易
		let price = await getPrices(swc);
		//分析市场交易 并下订单
		let result = await analyze(swc, price.price);

		//观察
		swc.huobi.ob.show_balance(swc, result);

		//TODO：止损

		//继续启动
		setTimeout(async ()=>{
			run(swc);
		}, 1000)
	}catch(e){
		console.log(e);
		run(swc);
	}
}

module.exports = async (swc)=>{
	MK = swc.config.huobi.market;
	A = MK.A;
	B = MK.B;
	C = MK.C;
	try{
		await run(swc);
	}catch(e){
		console.log(e);
		await run(swc);
	}
}
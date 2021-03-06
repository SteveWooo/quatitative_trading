const AMOUNT_PER_BUY = 10;//usdt
const ANALYZE_DEPTH = 0;
var MK;
var A;
var B;
var C;
const fs = require('fs');
async function getPrices(swc, market){
	let data;
	let price = {};
	try{
		data = await swc.huobi.depth(swc, market.A, 'step0');
		if(!data.bids || !data.asks){
			throw market.A + "has no data";
		}
		price[market.A] = {
			buy : data.bids,
			sell : data.asks
		}

		data = await swc.huobi.depth(swc, market.C, 'step0');
		if(!data.bids || !data.asks){
			throw market.C + "has no data";
		}
		price[market.C] = {
			buy : data.bids,
			sell : data.asks
		}

		data = await swc.huobi.depth(swc, market.B, 'step0');
		if(!data.bids || !data.asks){
			throw market.B + "has no data";
		}
		price[market.B] = {
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

async function buy_in(swc, result, market){
	let temp_btc = int(AMOUNT_PER_BUY / result.price.buy[market.C]);
	let temp_eth = int(temp_btc * 0.998 / result.price.buy[market.B]);
	let temp_usdt = int(temp_eth * 0.998 * result.price.sell[market.A]);
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

	let msg = "buy:" + temp_btc + " C when "+market.C+"=" + result.price.buy[market.C] + "\n" +
		"buy:" + temp_eth + " B when "+market.B+"=" + result.price.buy[market.B] + "\n" + 
		"sell:" + temp_usdt + " A when "+market.A+"=" + result.price.sell[market.A] + "\n" + 
		"in_dif_val:" + result.in_dif_val + "\n" +
		"out_dif_val:" + result.out_dif_val + "\n" + 
		"market : " + JSON.stringify(result.price) + "\n" + 
		"===========================================================";

	log(msg);
	//order : 
	let order = [{
		"amount" : temp_btc,
		"price" : result.price.buy[market.C],
		"type" : "buy-limit",
		"symbol" : market.C,
	},{
		"amount" : temp_eth,
		"price" : result.price.buy[market.B],
		"type" : "buy-limit",
		"symbol" : market.B,
	},{
		"amount" : temp_eth * 0.998,
		"price" : result.price.sell[market.A],
		"type" : "sell-limit",
		"symbol" : market.A,
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

async function buy_out(swc, result, market){
	// let temp_eth = int(AMOUNT_PER_BUY / result.price.buy['ethusdt']);
	// let temp_btc = int(temp_eth * 0.998 * result.price.sell['ethbtc']);
	// let temp_usdt = int(temp_btc * 0.998 * result.price.sell['btcusdt']);
	let temp_eth = int(AMOUNT_PER_BUY / result.price.buy[market.A]);
	let temp_btc = int(temp_eth * 0.998 * result.price.sell[market.B]);
	let temp_usdt = int(temp_btc * 0.998 * result.price.sell[market.C]);
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

	let msg = "buy:" + temp_eth + " A when "+market.A+"=" + result.price.buy[market.A] + "\n" +
		"sell:" + temp_btc + " B when "+market.B+"=" + result.price.sell[market.B] + "\n" + 
		"sell:" + temp_usdt + " C when "+market.C+"=" + result.price.sell[market.C] + "\n" + 
		"in_dif_val:" + result.in_dif_val + "\n" +
		"out_dif_val:" + result.out_dif_val + "\n" + 
		"market : " + JSON.stringify(result.price) + "\n" + 
		"===========================================================";

	log(msg);
	let order = [{
		"amount" : temp_eth,
		"price" : result.price.buy[market.A],
		"type" : "buy-limit",
		"symbol" : market.A,
	},{
		"amount" : temp_eth * 0.998,
		"price" : result.price.sell[market.B],
		"type" : "sell-limit",
		"symbol" : market.B,
	},{
		"amount" : temp_btc * 0.998,
		"price" : result.price.sell[market.C],
		"type" : "sell-limit",
		"symbol" : market.C,
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

function analyze_price(swc, price, market){
	let p = {
		buy : {},
		sell : {}
	}

	let temp = {
		buy : {},
		sell : {}
	}

	//直接出的市价交易：
	temp.buy[market.A] = get_avg(swc, price[market.A].sell, market.A);
	temp.buy[market.B] = get_avg(swc, price[market.B].sell, market.B);
	temp.buy[market.C] = get_avg(swc, price[market.C].sell, market.C);

	temp.sell[market.A] = get_avg(swc, price[market.A].buy, market.A);
	temp.sell[market.B] = get_avg(swc, price[market.B].buy, market.B);
	temp.sell[market.C] = get_avg(swc, price[market.C].buy, market.C);

	// return temp;

	// //秒出的价格
	// //卖家市场价格：
	p.buy[market.A] = (temp.buy[market.A] + ((temp.buy[market.A] + temp.sell[market.A]) / 2)) / 2;
	p.buy[market.B] = (temp.buy[market.B] + ((temp.buy[market.B] + temp.sell[market.B]) / 2)) / 2;
	p.buy[market.C] = (temp.buy[market.C] + ((temp.buy[market.C] + temp.sell[market.C]) / 2)) / 2;
	//买家市场价格：
	p.sell[market.A] = (temp.sell[market.A] + ((temp.buy[market.A] + temp.sell[market.A]) / 2)) / 2;
	p.sell[market.B] = (temp.sell[market.B] + ((temp.buy[market.B] + temp.sell[market.B]) / 2)) / 2;
	p.sell[market.C] = (temp.sell[market.C] + ((temp.buy[market.C] + temp.sell[market.C]) / 2)) / 2;
	return p;


	//中间价格
	p.sell[market.A] = p.buy[market.A] = (temp.buy[market.A] + temp.sell[market.A]) / 2;
	p.sell[market.B] = p.buy[market.B] = (temp.buy[market.B] + temp.sell[market.B]) / 2;
	p.sell[market.C] = p.buy[market.C] = (temp.buy[market.C] + temp.sell[market.C]) / 2;

	// //慢出单的价格
	//卖家市场价格：
	// p.buy[market.A] = (temp.sell[market.A] + ((temp.buy[market.A] + temp.sell[market.A]) / 2)) / 2;
	// p.buy[market.B] = (temp.sell[market.B] + ((temp.buy[market.B] + temp.sell[market.B]) / 2)) / 2;
	// p.buy[market.C] = (temp.sell[market.C] + ((temp.buy[market.C] + temp.sell[market.C]) / 2)) / 2;

	// //买家市场价格：
	// p.sell[market.A] = (temp.buy[market.A] + ((temp.buy[market.A] + temp.sell[market.A]) / 2)) / 2;
	// p.sell[market.B] = (temp.buy[market.B] + ((temp.buy[market.B] + temp.sell[market.B]) / 2)) / 2;
	// p.sell[market.C] = (temp.buy[market.C] + ((temp.buy[market.C] + temp.sell[market.C]) / 2)) / 2;

	// console.log(p);
	return p;
}

function log_mk_price(swc, market, mk_price, price){
	let str = market.A + " market sell:" + mk_price[market.A].sell[0] + "\n" + 
		market.B + " market sell:" + mk_price[market.B].sell[0] + "\n" + 
		market.C + " market sell:" + mk_price[market.C].sell[0] + "\n" + 
		market.A + " market buy:" + mk_price[market.A].buy[0] + "\n" + 
		market.B + " market buy:" + mk_price[market.B].buy[0] + "\n" + 
		market.C + " market buy:" + mk_price[market.C].buy[0] + "\n==\n" + 
		market.A + " sell:" + price.sell[market.A] + "\n" + 
		market.B + " sell:" + price.sell[market.B] + "\n" + 
		market.C + " sell:" + price.sell[market.C] + "\n" + 
		market.A + " buy :" + price.buy[market.A] + "\n" + 
		market.B + " buy :" + price.buy[market.B] + "\n" + 
		market.C + " buy :" + price.buy[market.C] + "\n";
	log(str);
}

//这个时间内不能重复下单
var Buy_time_less = 20000;
var Last_buy = 0;
function check_balance_in(swc, price, market, mk_price){
	// let need_usdt = AMOUNT_PER_BUY;
	// let need_btc = (AMOUNT_PER_BUY / price.buy['btcusdt']) * 0.998;
	// let need_eth = (need_btc / price.buy['ethbtc']) * 0.998;
	// if(global.swc.huobi.balance.usdt < need_usdt ||
	// 	global.swc.huobi.balance.btc < need_btc ||
	// 	global.swc.huobi.balance.eth < need_eth){
	// 	return false;
	// }
	let need_usdt = AMOUNT_PER_BUY;
	let need_C = (AMOUNT_PER_BUY / price.buy[market.C]) * 0.998;
	let need_A = (need_C / price.buy[market.B]) * 0.998;
	process.stdout.write('\x07');
	log_mk_price(swc, market, mk_price, price);
	if((+new Date()) - Last_buy < Buy_time_less){
		log("【"+new Date()+"】time not enough : lost\n" + "========================");
		return false;
	}

	if(global.swc.huobi.balance[market.b] < need_usdt ||
		global.swc.huobi.balance[market.c] < need_C ||
		global.swc.huobi.balance[market.a] < need_A){
		log("【"+new Date()+"】lost\n" + "========================");
		console.log('not enough usdt ? ' + (global.swc.huobi.balance[market.b] < need_usdt) + "");
		console.log('not enough '+market.c+' ? ' + (global.swc.huobi.balance[market.c] < need_C) + "");
		console.log('not enough '+market.a+' ? ' + (global.swc.huobi.balance[market.a] < need_A) + "");
		console.log('not enough money for in..............');
		// process.stdout.write('\x07');
		return false;
	}
	
	Last_buy = +new Date();
	return true;
}

function check_balance_out(swc, price, market, mk_price){
	// let need_usdt = AMOUNT_PER_BUY;
	// let need_eth = (AMOUNT_PER_BUY / price.buy['ethusdt']) * 0.998;
	// let need_btc = (need_eth * price.sell['ethbtc']) * 0.998;
	// if(global.swc.huobi.balance.usdt < need_usdt ||
	// 	global.swc.huobi.balance.btc < need_btc ||
	// 	global.swc.huobi.balance.eth < need_eth){
	// 	return false;
	// }
	let need_usdt = AMOUNT_PER_BUY;
	let need_A = (AMOUNT_PER_BUY / price.buy[market.A]) * 0.998;
	let need_C = (need_A * price.sell[market.B]) * 0.998;
	process.stdout.write('\x07');
	if((+new Date()) - Last_buy < Buy_time_less){
		log("【"+new Date()+"】time not enough : lost\n" + "========================");
		return false;
	}
	log_mk_price(swc, market, mk_price, price);
	if(global.swc.huobi.balance[market.b] < need_usdt ||
		global.swc.huobi.balance[market.c] < need_C ||
		global.swc.huobi.balance[market.a] < need_A){
		log("【"+new Date()+"】lost\n" + "========================");
		console.log('not enough usdt ? ' + (global.swc.huobi.balance[market.b] < need_usdt) + "");
		console.log('not enough '+market.c+' ? ' + (global.swc.huobi.balance[market.c] < need_C) + "");
		console.log('not enough '+market.a+' ? ' + (global.swc.huobi.balance[market.a] < need_A) + "");
		console.log('not enough money for out..............');
		// process.stdout.write('\x07');
		return false;
	}
	
	Last_buy = +new Date();
	return true;
}

async function analyze(swc, price, market){
	let result;
	try{
		result = {
			market : market,
			price : analyze_price(swc, price, market),
			source_price : {
				buy : 0,
				sell : 0
			},
			relative_price : {
				buy : 0,
				sell : 0
			},
		};
	}catch(e){
		throw e;
	}
	result.source_price.buy = result.price.buy[market.B];
	result.source_price.sell = result.price.sell[market.B];

	result.relative_price.buy = result.price.buy[market.A] / result.price.buy[market.C];
	result.relative_price.sell = result.price.sell[market.A] / result.price.sell[market.C];


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

async function run(swc, market){
	try{
		//获取市场交易
		let price = await getPrices(swc, market);
		if(price.code != 2000 || !price.price){
			throw price;
		}

		// //分析市场交易 并下订单
		let result = await analyze(swc, price.price, market);
		console.log({
			market : result.market.B,
			in_dif_val : result.in_dif_val,
			out_dif_val : result.out_dif_val,
			price : {
				source_price : result.source_price,
				relative_price : result.relative_price
			}
		});
		//观察 更新余额
		await swc.huobi.ob.show_balance(swc, result, market);

		//卖盘优先
		if(result.out_dif_val > 0 && check_balance_out(swc, result.price, market, price.price)){
			if(process.argv[2] == "buy" ){
				await buy_out(swc, result, market);
			}
			process.stdout.write('\x07');
			//限制一次只能买一边 不然余额没更新
			setTimeout(async ()=>{
				run(swc, market);
			}, 1000);
			return ;
		}
		if(result.in_dif_val > 0 && check_balance_in(swc, result.price, market, price.price)){
			if(process.argv[2] == "buy"){
				await buy_in(swc, result, market);
			}
			process.stdout.write('\x07');
			//限制一次只能买一边 不然余额没更新
			setTimeout(async ()=>{
				run(swc, market);
			}, 1000);
			return ;
		}

		//TODO：止损

		//继续启动
		setTimeout(async ()=>{
			run(swc, market);
		}, 1000);
		return ;
	}catch(e){
		console.log(e);
		run(swc, market);
	}
}

var find = require('./test_find');
const DEPTH = {
	'dtabtc' : 1500,
	'dtausdt' : 1500,
	'ocnusdt' : 5000,
	'ocnbtc' : 5000,
	'btcusdt' : 0.01
}

module.exports = async (swc)=>{
	MK = swc.config.huobi.market;
	A = MK.A;
	B = MK.B;
	C = MK.C;
	let market = {
		A : "ocnusdt",
		B : "ocnbtc",
		C : "btcusdt"
	};
	market.a = 'ocn';
	market.b = 'usdt';
	market.c = 'btc';

	swc.huobi.ob.init(swc, market);

	if(process.argv[2] == "ob"){		
		try {
			find(swc, getPrices, analyze);
		}catch(e){
			console.log(e);
			find(swc, getPrices, analyze);
		}
		return ;
	}

	if(process.argv[2] == "buy" || process.argv[2] == "buy_ob"){
		try{
			await run(swc, market);
		}catch(e){
			console.log(e);
			await run(swc, market);
		}
	}
}
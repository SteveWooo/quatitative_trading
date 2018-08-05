// var orders = [{
// 	type : "buy or sell",
// 	amount : float,
// 	price : float
// }];
global = {
	Orders : {
		buy : [],
		sell : []
	},
	Balance : {
		usdt : 100000,
		btc : 10
	}
}

const get_balance = require('./get_balance');
const simulate = require('./simulate');
const analyze = require('./analyze');

function buy(swc, g){
	let buy_order = {
		amount : g.UNIT,
		price : g.result.price.bids
	}
	global.Balance.usdt -= buy_order.amount * buy_order.price;

	let sell_order = {
		amount : g.UNIT,
		price : g.result.price.asks
	}
	global.Balance.btc -= buy_order.amount;

	global.Orders.buy.push(buy_order);
	global.Orders.sell.push(sell_order);

	swc.huobi.controller.btc_short.update(swc);
}

async function run(swc){
	g = {
		balance : {},
		depth : {},
		UNIT : 0.1
	}

	try{
		//获取市场当前交易价格
		let depth_price = await swc.huobi.depth(swc, 'btcusdt', 'step0');
		g.depth = depth_price;
		let result = analyze(swc, g);
		g.result = result;
		if(result.price.asks - result.price.bids <= 50){
			if(global.Orders.buy.length >= 50){
				console.log('alert');
				return ;
			}

			if(global.Orders.sell.length >= 50){
				console.log('alert');
				return ;
			}
			if(global.Orders.buy.length <= 10 || global.Orders.sell.length <= 10){
				buy(swc, g);
			}
		}
		setTimeout(()=>{
			run(swc);
		}, 60000)
	}catch(e){
		console.log(e);
	}
}

module.exports = (swc)=>{
	try{
		let balance = swc.huobi.controller.btc_short.balance.init(swc);
		let orders = swc.huobi.controller.btc_short.order.init(swc);
		global.Orders = orders;
		global.Balance = balance;

		if(swc.argv['m'] == "buy"){
			run(swc);
			simulate(swc);
		} else {
			simulate(swc);
		}
	}catch(e){
		console.log(e);
	}
}
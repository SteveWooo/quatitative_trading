function eat_order(swc, depth){
	let orders = global.Orders;
	for(var i=0;i<orders.buy.length;i++){
		if(orders.buy[i].price >= depth.asks[0][0]){
			global.Balance.btc += orders.buy[i].amount * 0.998;
			console.log('buy success');
			global.Orders.buy.splice(i, 1);
			swc.huobi.controller.btc_short.update(swc);
			break;
		}
	}

	for(var i=0;i<orders.sell.length;i++){
		if(orders.sell[i].price <= depth.bids[0][0]){
			global.Balance.usdt += orders.sell[i].amount * orders.sell[i].price * 0.998;
			console.log('sell success');
			global.Orders.sell.splice(i, 1);
			swc.huobi.controller.btc_short.update(swc);
			break;
		}
	}
}

const get_balance = require('./get_balance');
function watch (swc){
	let balance = get_balance(swc);
	let total = balance.trade.usdt + balance.trade.btc * 7000 + 
		balance.frozen.usdt + balance.frozen.btc * 7000;
	console.log("order buys length:" + global.Orders.buy.length);
	console.log("order sells length:" + global.Orders.sell.length);
	console.log("balance:");
	console.log(balance);
	console.log("total:" + total);
}

async function run(swc){
	let depth_price = await swc.huobi.depth(swc, 'btcusdt', 'step0');
	eat_order(swc, depth_price);

	setTimeout(()=>{
		watch(swc);
		run(swc);
	}, 1000)
}

function simulate(swc){
	run(swc);
}
module.exports = simulate;
let check_sell_dif = (swc, g)=>{
	let price = g.price;
	let balance = g.balance;
	let market = g.market;
	let need_usdt = g.AMOUNT_PER_BUY;
	let need_C = (g.AMOUNT_PER_BUY / price.buy[market.C]) * 0.998;
	let need_A = (need_C / price.buy[market.B]) * 0.998;

	if(balance[market['b']] < need_usdt){
		console.log('not enough usdt...');
		return false;
	}
	if(balance[market['a']] < need_A){
		console.log('not enough ' + market['a'] + "...");
		return false;
	}
	if(balance[market['c']] < need_C){
		console.log('not enough ' + market['c'] + "...");
		return false;
	}

	if(g.out_dif_val > 0){
		process.stdout.write('\x07');
		return true;
	}
	// swc.huobi.controller.trangle.log(swc, 'lost\n' + JSON.stringify(g.price), 'trade');

	return false;
}

let check_buy_dif = (swc, g)=>{
	let price = g.price;
	let market = g.market;
	let balance = g.balance.trade;
	let need_usdt = g.AMOUNT_PER_BUY;
	let need_A = (g.AMOUNT_PER_BUY / price.buy[market.A]) * 0.998;
	let need_C = (need_A * price.sell[market.B]) * 0.998;

	if(balance[market['b']] < need_usdt){
		console.log('not enough usdt...');
		return false;
	}
	if(balance[market['a']] < need_A){
		console.log('not enough ' + market['a'] + "...");
		return false;
	}
	if(balance[market['c']] < need_C){
		console.log('not enough ' + market['c'] + "...");
		return false;
	}

	if(g.in_dif_val > 0){
		process.stdout.write('\x07');
		return true;
	}

	return false;
}

//一定时间内不能重复购买
let check_time = (swc, g)=>{
	let now = +new Date();
	if(now - g.last_buy_time < g.buy_span){
		console.log('time span not enough');
		return false;
	}
	return true;
}

module.exports = (swc, g)=>{
	can_buy = true;
	can_sell = true;
	if(!check_time(swc, g)){
		can_buy = false;
		can_sell = false;
	}
	if(!check_buy_dif(swc, g)){
		can_buy = false;
	}

	if(!check_sell_dif(swc, g)){
		can_sell = false;
	}

	return {
		can_buy : can_buy,
		can_sell : can_sell
	}
}
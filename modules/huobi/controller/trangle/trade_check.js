function int(num){
	return num;
}

let check_sell_dif = (swc, g)=>{
	let price = g.price;
	let balance = g.balance.trade;
	let market = g.market;

	let temp_A = int(g.AMOUNT_PER_BUY / g.price.buy[market.A]);
	let temp_C = int(temp_A * 0.998 * g.price.sell[market.B]);
	let temp_usdt = int(temp_C * 0.998 * g.price.sell[market.C]);

	console.log('sell condition:');
	var balance_enough = true;
	if(balance[market['b']] < temp_usdt){
		console.log('not enough usdt...need : ' + temp_usdt);
		balance_enough = false;
	}
	if(balance[market['a']] < temp_A){
		console.log('not enough ' + market['a'] + "...need : " + temp_A);
		balance_enough = false;
	}
	if(balance[market['c']] < temp_C){
		console.log('not enough ' + market['c'] + "...need : " + temp_C);
		balance_enough = false;
	}

	if(g.out_dif_val > 0){
		process.stdout.write('\x07');
		if(balance_enough){
			return true;
		}else {
			swc.huobi.controller.trangle.log(swc, 'lost\n' + JSON.stringify(g.price), 'trade');
			return false;
		}
	}

	return false;
}

let check_buy_dif = (swc, g)=>{
	let price = g.price;
	let market = g.market;
	let balance = g.balance.trade;
	let temp_C = int(g.AMOUNT_PER_BUY / g.price.buy[market.C]);
	let temp_A = int(temp_C * 0.998 / g.price.buy[market.B]);
	let temp_usdt = int(temp_A * 0.998 * g.price.sell[market.A]);

	console.log('buy condition:')
	var balance_enough = true;
	if(balance[market['b']] < temp_usdt){
		console.log('not enough usdt...need : ' + temp_usdt);
		balance_enough = false;
	}
	if(balance[market['a']] < temp_A){
		console.log('not enough ' + market['a'] + "...need : " + temp_A);
		balance_enough = false;
	}
	if(balance[market['c']] < temp_C){
		console.log('not enough ' + market['c'] + "...need : " + temp_C);
		balance_enough = false;
	}

	if(g.in_dif_val > 0){
		process.stdout.write('\x07');
		if(balance_enough){
			return true;
		}else {
			swc.huobi.controller.trangle.log(swc, 'lost\n' + JSON.stringify(g.price), 'trade');
			return false;
		}
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
		return {
			can_buy : can_buy,
			can_sell : can_sell
		}
	}
	can_buy = check_buy_dif(swc, g);
	can_sell = check_sell_dif(swc, g);

	return {
		can_buy : can_buy,
		can_sell : can_sell
	}
}
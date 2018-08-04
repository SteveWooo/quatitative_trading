function get_values(swc, g){
	let market = g.market;
	let sell = g.price.sell;
	let balance = g.balance;
	let value = {};
	value[market['b']] = parseFloat(balance.trade[market['b']]);
	value[market['a']] = parseFloat(balance.trade[market['a']] * sell[market['A']]);
	value[market['c']] = parseFloat(balance.trade[market['c']] * sell[market['C']]);

	var all_can_trade = 0;
	for(var i in value){
		all_can_trade += value[i];
	}

	var frozen_value = 0;
	frozen_value += parseFloat(balance.frozen[market['b']]);
	frozen_value += parseFloat(balance.frozen[market['a']] * sell[market['A']]);
	frozen_value += parseFloat(balance.frozen[market['c']] * sell[market['C']]);

	return {
		values : value,
		all_can_trade : all_can_trade,
		all : frozen_value + all_can_trade
	}
}

exports.get_values = get_values;
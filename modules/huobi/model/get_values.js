function get_values(swc, g){
	let market = g.market;
	let sell = g.price.sell;
	let balance = g.balance.trade;
	let value = {};
	value[market['b']] = parseFloat(balance[market['b']]);
	value[market['a']] = parseFloat(balance[market['a']] * sell[market['A']]);
	value[market['c']] = parseFloat(balance[market['c']] * sell[market['C']]);

	var all_usdt_value = 0;
	for(var i in value){
		all_usdt_value += value[i];
	}

	return {
		values : value,
		all : all_usdt_value
	}
}

exports.get_values = get_values;
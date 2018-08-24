const ABSOLUTE_PRICE = {
	btc : 6231,
	// btc : 7100,
	ocn : 0.00314372,
	eth : 287
}
//
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

	var absolute_value = 0;
	absolute_value += parseFloat(balance.trade[market['b']]) + parseFloat(balance.frozen[market['b']]);
	absolute_value += parseFloat(balance.trade[market['a']] * ABSOLUTE_PRICE[market['a']]) + 
		parseFloat(balance.frozen[market['a']] * ABSOLUTE_PRICE[market['a']]);
	absolute_value += parseFloat(balance.trade[market['c']] * ABSOLUTE_PRICE[market['c']]) + 
		parseFloat(balance.frozen[market['c']] * ABSOLUTE_PRICE[market['c']]);

	return {
		values : value,
		all_can_trade : all_can_trade,
		all : frozen_value + all_can_trade,
		absolute_value : absolute_value
	}
}

exports.get_values = get_values;
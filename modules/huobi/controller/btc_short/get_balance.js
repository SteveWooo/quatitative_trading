module.exports = (swc)=>{
	let orders = global.Orders;
	let b = {
		usdt : global.Balance.usdt,
		btc : global.Balance.btc
	}
	let frozen = {
		usdt : 0,
		btc : 0
	}
	for(var i=0;i<orders.buy.length;i++){
		frozen.usdt += orders.buy[i].amount * orders.buy[i].price;
	}

	for(var i=0;i<orders.sell.length;i++){
		frozen.btc += orders.sell[i].amount;
	}

	return {
		trade : b,
		frozen : frozen
	}
}
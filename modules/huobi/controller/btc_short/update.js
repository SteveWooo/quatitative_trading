module.exports = (swc)=>{
	let orders = global.Orders;
	let balance = global.Balance;

	swc.huobi.controller.btc_short.order.set(swc, orders);
	swc.huobi.controller.btc_short.balance.set(swc, balance);
}
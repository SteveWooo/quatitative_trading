function place(swc, order){
	return new Promise(async (resolve, reject)=>{
		let body = {
			"account-id" : swc.config.huobi.accounts.spot,
			"amount" : Math.floor(order.amount * 10000) / 10000,
			"price" : order.price,
			"type" : order.type,
			"symbol" : order.symbol,
			"source" : "api",
		}
		if(order.symbol == "ethbtc"){
			order.price = Math.floor(order.price * 1000000) / 1000000;
		}
		if(order.symbol == "ethusdt" || order.symbol == "btcusdt" || order.symbol == "ltcusdt"){
			order.price = Math.floor(order.price * 100) / 100;
		}
		for(var i in body){
			if(!body[i]){
				reject({
					code : 5001,
					message : "内容缺失：" + i
				});
				return ;
			}
		}

		let result = await swc.huobi.order_place(swc, body);
		resolve(result);
	})
}

async function cancel(swc, orders){
	orders.map(async id=>{
		let result = await swc.huobi.order_cancel(swc, id);
		console.log(result);
	})
}

/*
orders : [{
	type : 'buy-limit | sell-limit',
	symbol : '',
	amount : '',
	price : ''
}],

*/
//下单
exports.order_place = async(swc, orders)=>{
	let order_ids = [];
	try{
		for(var i=0;i<orders.length;i++){
			let result = await place(swc, orders[i]);
			if(result.code != 2000){
				let r = await cancel(swc, order_ids);
				throw result;
			}

			order_ids.push(result.body.data);
		}
		return order_ids;
	}catch (e){
		//alerm
		console.log(e);
		console.log("trade error !!!!!!!");
		return e;
	}
}
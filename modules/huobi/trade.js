function scientificToNumber_dtabtc(num) {
    var str = num.toString();
    var reg = /(\d+)\.(\d+)(e)([\-]?\d+)$/;
    var arr, len,
        zero = '';
    if (!reg.test(str)) {
        return num;
    } else {
        arr = reg.exec(str);
        len = Math.abs(arr[4]) - 1;
        for (var i = 0; i < len; i++) {
            zero += '0';
        }

        let res = '0.' + zero + arr[1] + arr[2];
        res = res.substring(0, res.indexOf('.')) + res.substring(res.indexOf('.'), 12);
        return res;
    }
}

function place(swc, order){
	return new Promise(async (resolve, reject)=>{
		let body = {
			"account-id" : swc.config.huobi.accounts.spot,
			"amount" : order.amount,
			"price" : order.price,
			"type" : order.type,
			"symbol" : order.symbol,
			"source" : "api",
		}
		if(order.symbol == "ethbtc"){
			body.price = Math.floor(order.price * 1000000) / 1000000;
		}
		if(order.symbol == "dtabtc"){
			body.price = scientificToNumber_dtabtc(body.price);
		}
		if(order.symbol == "ethusdt" || order.symbol == "btcusdt" || order.symbol == "ltcusdt"){
			body.price = Math.floor(body.price * 100) / 100;
		}
		if(order.symbol == "dtausdt"){
			body.price = Math.ceil(body.price * 100000000) / 100000000;
		}

		if(order.symbol == "dtabtc"){
			body.amount = Math.floor(order.amount * 100) / 100;
		} else {
			body.amount = Math.floor(order.amount * 10000) / 10000;
		}
		for(var i in body){
			if(!body[i]){
				reject({
					code : 5001,
					message : "内容缺失：" + i,
					body : body,
					order : order
				});
				return ;
			}
		}
		console.log(body);
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
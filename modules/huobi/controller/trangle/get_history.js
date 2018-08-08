module.exports = async (swc, g)=>{
	let trades = {};
	let data = await swc.huobi.trades(swc, g.market['A'], 1000);
	if(data == undefined || data.length == 0){
		throw {
			code : 4000,
			msg : data
		}
	}
	trades[g.market['A']] = data;
	let buy = {
		length : 0,
		sum : 0,
		max : 0,
		min : trades[g.market['A']][0].data[0].price
	}

	let sell = {
		length : 0,
		sum : 0,
		max : 0,
		min : trades[g.market['A']][0].data[0].price
	}
	trades[g.market['A']].map(d=>{
		d = d.data[0];
		if(d.direction == "buy"){
			buy.length ++;
			buy.sum += d.price;
			buy.max = d.price >= buy.max ? d.price : buy.max;
			buy.min = d.price <= buy.min ? d.price : buy.min;
		}

		if(d.direction == "sell"){
			sell.length ++ ;
			sell.sum += d.price
			sell.max = d.price >= sell.max ? d.price : sell.max;
			sell.min = d.price <= sell.min ? d.price : sell.min;
		}
	})

	buy.avg = buy.sum / buy.length;
	sell.avg = sell.sum / sell.length;

	let msg = "";
	msg = "buy : \n" + msg;
	for(var i in buy){
		msg = msg + i + ":" + buy[i] + ",";
	}

	msg = msg + "\nsell : \n";
	for(var i in sell){
		msg = msg + i + ":" + sell[i] + ",";
	}

	swc.huobi.controller.trangle.log_history(swc, msg);

	return {
		buy : buy,
		sell : sell
	}
}
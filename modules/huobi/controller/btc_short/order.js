const fs = require('fs');

exports.set = (swc, orders)=>{
	fs.writeFileSync('./modules/huobi/controller/btc_short/orders', JSON.stringify(orders));
}

exports.get = (swc)=>{
	let data = fs.readFileSync('./modules/huobi/controller/btc_short/orders').toString();
	return isJson(data);
}

function isJson(str){
	try{
		str = JSON.parse(str);
		return str;
	}catch(e){
		return undefined;
	}
}

exports.init = (swc)=>{
	let order = fs.readFileSync('./modules/huobi/controller/btc_short/orders').toString();
	let json_order = isJson(order);
	if(!json_order){
		let o = {
			buy : [],
			sell : []
		}
		fs.writeFileSync('./modules/huobi/controller/btc_short/orders', JSON.stringify(o));
		return o;
	} else {
		return json_order;
	}
}
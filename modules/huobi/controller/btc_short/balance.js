const fs = require('fs');

exports.set = (swc, balance)=>{
	fs.writeFileSync('./modules/huobi/controller/btc_short/balances', JSON.stringify(balance));
}

exports.get = (swc)=>{
	let data = fs.readFileSync('./modules/huobi/controller/btc_short/balances').toString();
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
	let balance = fs.readFileSync('./modules/huobi/controller/btc_short/balances').toString();
	let json_balance = isJson(balance);
	if(!json_balance){
		let b = {
			usdt : 100000,
			btc : 10
		}
		fs.writeFileSync('./modules/huobi/controller/btc_short/balances', JSON.stringify(b));
		return b;
	} else {
		return json_balance;
	}
}
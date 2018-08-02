const fs = require('fs');
module.exports = (swc, balance)=>{
	let date = new Date();
	let b = "";
	for(var i in balance.trade){
		b += i + ":" + balance.trade[i];
	}
	msg = "【" + date + "】:" + "\n" + b + "\n=================================";
	fs.appendFileSync('./logs/balances.log', msg);
}
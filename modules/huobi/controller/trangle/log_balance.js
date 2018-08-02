const fs = require('fs');
module.exports = (swc, g)=>{
	if(JSON.stringify(g.last_balance) == JSON.stringify(g.balance)){
		//相同时不打日志
		return g.last_balance;
	}
	let date = new Date();
	let b = "";
	for(var i in g.balance.trade){
		b += "\n" + i + ":" + g.balance.trade[i] ;
	}
	msg = "【" + date + "】:" + b + "\n=================================\n";
	fs.appendFileSync('./logs/balances.log', msg);
	//打完日志 返回最新余额 更新内存
	return g.balance;
}
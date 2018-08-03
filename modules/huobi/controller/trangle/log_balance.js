const fs = require('fs');
async function mail_mention(swc, g){
	let mention = "";
	mention += "time : <br />" + (new Date());
	mention += "<br /><br />trade :";
	for(var i in g.balance.trade){
		mention += "<br />" + i + ":" + g.balance.trade[i];
	}
	mention += "<br /><br />frozen:";
	for(var i in g.balance.frozen){
		if(g.balance.frozen[i] != 0){
			return ;
		}
		mention += "<br />" + i + ":" + g.balance.frozen[i];
	}
	await swc.huobi.tools.mail_mention(swc, g, {mention:mention});
}

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
	//发送邮件提醒
	// console.log('mention');
	mail_mention(swc, g);
	//打完日志 返回最新余额 更新内存
	return g.balance;
}
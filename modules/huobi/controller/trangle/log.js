const fs = require('fs');
module.exports = (swc, msg, type)=>{
	let date = new Date();
	msg = "【" + date + "】:" + type + "\n" + msg + "\n=================================";
	fs.appendFileSync('./logs/huobi_trangle.log', msg);
}
const fs = require('fs');
module.exports = (swc, msg)=>{
	let date = new Date();
	msg = "【" + date + "】:" + "\n" + msg + "\n=================================";
	fs.appendFileSync('./logs/huobi_history.log', msg);
}
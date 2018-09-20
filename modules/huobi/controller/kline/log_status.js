const fs = require('fs');

function analyze (swc, g, data){
	data.pop();
	let amount = {
		usdt : 0,
		ltc : 0
	};
	for(var i=0;i<data.length;i++){
		let count = data[i].substring(data[i].lastIndexOf(":") + 1);
		if(data[i].indexOf("buy") > 0){
			amount.usdt -= count;
			amount.ltc += 0.998
		}

		if(data[i].indexOf("sell") > 0){
			amount.usdt += count * 0.998;
			amount.ltc -= 1
		}
	}

	let result = {
		amount : amount
	}

	return result;
}

module.exports = (swc, g)=>{
	let data = fs.readFileSync(g.file_path+"/trades.log").toString().split('\n');
	return analyze(swc, g, data);
}
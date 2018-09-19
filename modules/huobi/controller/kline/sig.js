const fs = require('fs');
const DEPTH = 2;

async function get_price(swc, g, type){
	let data = await swc.huobi.depth(swc, g.market + "usdt", 'step0');
	let dep = 0;
	for(var i=0;i<data[type].length;i++){
		dep += data[type][i][1];
		if(dep >= DEPTH){
			return  data[type][i][0];
		}
	}
}

async function sell(swc, g, price){
	fs.appendFileSync(g.file_path + "/trades.log", "【"+new Date()+"】sell:" + price + "\n")
}

async function buy(swc, g, price){
	fs.appendFileSync(g.file_path + "/trades.log", "【"+new Date()+"】buy:" + price + "\n")
}

module.exports = async function(swc, g){
	if(g.result.sig == "buy"){
		let price = await get_price(swc, g, "asks");
		await buy(swc, g, price);
		g.status = "sell";
	}

	if(g.result.sig == "sell"){
		let price = await get_price(swc, g, "bids");
		await sell(swc, g, price);

		g.status = "buy";
	}

	return g;
}
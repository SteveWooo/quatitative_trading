const fs = require('fs');

function log_check(swc, g){
	fs.appendFileSync('./logs/huobi_binance/check', JSON.stringify(g.analyze) + "\n============================\n");
}

async function main(swc, g){
	try {
		var depths = await swc.huobi.controller.huobi_binance.get_depths(swc);
		g.depths = depths;
		var analyze = swc.huobi.controller.huobi_binance.analyze(swc, g);
		g.analyze = analyze
		if(analyze.check.buy_huobi > 0 || analyze.buy_binance > 0){
			log_check(swc, g);
		}

		setTimeout(function(){
			main(swc, g);
		}, g.refresh_span)
	}catch(e){
		console.log(e);
		setTimeout(function(){
			main(swc, g);
		}, g.refresh_span)
	}
}

module.exports = async (swc)=>{
	var g = {
		refresh_span : 2000,
		market : "eth",
		trade_place : [
			{name : "huobi"},
			{name : "binance"}
		],
		buy_span : 30000,
		AMOUNT_PER_BUY : 0.2
	}

	main(swc, g);
}
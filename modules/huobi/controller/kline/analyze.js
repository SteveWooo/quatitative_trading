function analyze(swc, g){
	let result = {};
	if(!g.kline.short || !g.kline.long){
		throw {
			message : "kline no full"
		}
	}
	if(g.status == "buy"){//短线在下 准备买入
		if(g.kline.short > g.kline.long + 0.2){
			result.sig = "buy";
		}
	} else if (g.status == "sell"){//短线在上 准备卖出 
		if(g.kline.short < g.kline.long - 0.2){
			result.sig = "sell";
		}
	}

	return result;
}

module.exports = (swc, g)=>{
	return analyze(swc, g);
}
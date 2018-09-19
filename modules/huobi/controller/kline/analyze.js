function analyze(swc, g){
	let result = {};
	if(g.status == "buy"){//短线在下 准备买入
		if(g.kline.short > g.kline.long){
			result.sig = "buy";
		}
	} else if (g.status == "sell"){//短线在上 准备卖出 
		if(g.kline.short < g.kline.long){
			result.sig = "sell";
		}
	}

	return result;
}

module.exports = (swc, g)=>{
	return analyze(swc, g);
}
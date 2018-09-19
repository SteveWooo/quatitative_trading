function sum_kline(swc, g, kline){
	let result = {}
	var short_sum = 0;
	for(var i=0;i<kline.short.length;i++){
		short_sum += kline.short[i].close;
	}
	result.short = short_sum / kline.short.length;

	var long_sum = 0;
	for(var i=0;i<kline.long.length;i++){
		long_sum += kline.long[i].close;
	}
	result.long = long_sum / kline.long.length;

	return result;
}

module.exports = async function(swc, g){
	try{
		var kline = {};
		kline.short = await swc.huobi.kline(swc, {
			symbol : "ltcusdt",
			period : "1min",
			size : 5
		})

		kline.long = await swc.huobi.kline(swc, {
			symbol : "ltcusdt",
			period : "1min",
			size : 30
		})
		return sum_kline(swc, g, kline);
	}catch(e){
		return undefined;
	}
}
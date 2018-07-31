module.exports = async (swc, g)=>{
	let data;
	let price = {};
	let market = g.market;
	try{
		for(var i in market){
			if(i.toUpperCase() != i){
				continue;
			}
			if(market[i] == market['a']+market['c']){
				data = await swc.huobi.depth(swc, market[i], 'step0');
			} else {
				data = await swc.huobi.depth(swc, market[i], 'step1');
			}
			if(!data.bids || !data.asks){
				throw market[i] + " has no data";
			}
			price[market[i]] = data;
		}
	}catch(e){
		return {
			code : 4001,
			message : e
		}
	}

	return {
		code : 2000,
		price : price
	};
}
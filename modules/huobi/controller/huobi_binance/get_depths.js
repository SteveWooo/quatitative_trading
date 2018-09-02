module.exports = async (swc)=>{
	try{
		let binance_depth = await swc.binance.depth(swc, 'ETHUSDT');
		let huobi_depth = await swc.huobi.depth(swc, 'ethusdt', 'step0');

		return {
			huobi : huobi_depth,
			binance : binance_depth
		}
	}catch(e){
		throw {
			message : "get depth error"
		}
	}	
}
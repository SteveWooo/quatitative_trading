const fs = require('fs');

async function run(swc, g){
	try {
		let kline = await swc.huobi.controller.kline.get_kline(swc, g);
		if(kline == undefined){
			throw {
				message : "kline error"
			}
			return ;
		}
		console.log(kline)
		g.kline = kline;

		let result = swc.huobi.controller.kline.analyze(swc, g);
		g.result = result;

		if(g.result.sig){
			console.log(new Date);
			console.log(g.result.sig);
			g = await swc.huobi.controller.kline.sig(swc, g);
		}

		setTimeout(()=>{
			run(swc, g);
		}, g.span)
	} catch(e){
		console.log(e);
		fs.appendFileSync(g.file_path + "/error.log", swc.utils.Error(e.message).log);
		setTimeout(()=>{
			run(swc, g);
		}, g.span)
	}
}

module.exports = (swc)=>{
	var g = {
		market : "ltc",
		union : 1,
		span : 2000,
		status : swc.argv['status'] == undefined ? "buy" : swc.argv['status'],
		file_path : "./modules/huobi/controller/kline",
		//changes :
		kline : {}
	}

	run(swc, g);
}
let swc = require('./modules/init')();
const fs = require('fs');

async function main(){
	//获取近期交易数据
	let data;
	swc.argv = {};
	for(var i=2;i<process.argv.length;i++){
		if(process.argv[i].indexOf('-') == 0 && process.argv[i + 1].indexOf('-') == 0){
			console.log('param error');
			return ;
		}
		if(process.argv[i].indexOf('-') == 0){
			swc.argv[process.argv[i].substring(1)] = process.argv[i + 1];
		}
	}

	if(swc.argv['server'] != undefined){
		swc.config.net.server = swc.argv['server'];
	}

	if(swc.argv['server'] == undefined || swc.argv['server'] == "guangzhou"){
		swc.config.huobi.accesskey = "95403aa1-dd593e85-b008b3bb-91a79";
		swc.config.huobi.secretkey = "e69db84a-5c6b65cb-a91d253b-1f2a4";
	}

	// console.log(swc);

	if(swc.argv['c'] == "btc_short"){
		swc.huobi.controller.btc_short.run(swc);
	} else if(swc.argv['c'] == "trangle"){
		swc.huobi.controller.trangle.run(swc);
	} else if (swc.argv['c'] == "huobi_binance"){
		swc.huobi.controller.huobi_binance.run(swc);
	} else if(swc.argv['c'] == "kline"){
		swc.huobi.controller.kline.run(swc);
	}
}

main();
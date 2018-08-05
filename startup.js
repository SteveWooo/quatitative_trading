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

	if(swc.argv['c'] == "btc_short"){
		swc.huobi.controller.btc_short.run(swc);
	} else if(swc.argv['c'] == "trangle"){
		swc.huobi.controller.trangle.run(swc);
	}
}

main();
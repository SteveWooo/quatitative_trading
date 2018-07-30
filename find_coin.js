let swc = require('./modules/init')();
const fs = require('fs');

async function main(){
	//获取近期交易数据
	let data;
	process.argv[2] = "ob";
	swc.huobi.strategies.test(swc);
}

main();
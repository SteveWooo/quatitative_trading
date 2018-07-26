let swc = require('./modules/init')();
const fs = require('fs');

async function main(){
	//获取近期交易数据
	let data;
	// data = await swc.huobi.trades(swc, "etcusdt", 100);
	// console.log(data); 
	// data = await swc.huobi.accounts(swc);
	// console.log(data);
	// data = await swc.huobi.accounts_balance(swc, '2137685');
	// 2133491
	// data = await swc.huobi.accounts_balance(swc, swc.config.huobi.accounts.spot);
	// console.log(data);
	// data = await swc.huobi.depth(swc, 'ethusdt', 'step0');
	// console.log(data);
	await swc.huobi.strategies.test(swc);
}

main();
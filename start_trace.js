let swc = require('./modules/init')();
const fs = require('fs');

async function main(){
	await swc.huobi.strategies.trace_k(swc);
}

main();
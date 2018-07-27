function set_balance(swc, balance){
	if(typeof balance != typeof []){
		console.log('!!!!!!!!!!!!!!!!!!get balance error');
		return ;
	}
	for(var i=0;i<balance.length;i++){
		if(balance[i].type == "trade"){
			global.swc.huobi.balance[balance[i]['currency']] = balance[i]['balance'];
		}
		if(balance[i].type == "frozen"){
			global.swc.huobi.frozen_balance[balance[i]['currency']] = balance[i]['balance'];
		}
	}
}

exports.init = async (swc, market)=>{
	let coin = market;
	let balance = await swc.huobi.accounts_balance(swc, swc.config.huobi.accounts.spot , [coin.a, coin.c, coin.b]);
	global.swc = {
		huobi : {
			status : true,
			begin_time : +new Date(),
			balance : {},
			frozen_balance : {},
			orders : [],
		}
	}


	set_balance(swc, balance);
}

/*
{ usdt: '26.60730782084023',btc: '0.00304299982270',dta: '3374.9375094' }
{ usdt: '26.20217440648523',btc: '0.00311301163243',dta: '3374.9469116' }
{ usdt: '26.02388390038023',btc: '0.00111545229728',dta: '3374.9547958' }
*/

exports.show_balance = async (swc, result, market)=>{
	let coin = market;
	let a = coin.a;
	let b = coin.b;
	let c = coin.c;
	let A = coin.A;
	let B = coin.B;
	let C = coin.C;
	let balance = await swc.huobi.accounts_balance(swc, swc.config.huobi.accounts.spot , [a, c, b]);
	let trades = await swc.huobi.order_open_list(swc);
	console.log('=========================');
	console.log("trades length:" + trades.length);
	set_balance(swc, balance);
	// let eth_value = global.swc.huobi.balance.eth * result.market_price.sell[A][0] * 0.998;
	// let btc_value = global.swc.huobi.balance.btc * result.market_price.sell[C][0] * 0.998;
	console.log(c + ' price:' + result.market_price.sell[C][0]);
	console.log(a + " price:" + result.market_price.sell[A][0]);
	if(result.market_price.sell[C][0] <= 8236.81){

	}
	if(result.market_price.sell[A][0] >= 484.43){
		
	}
	console.log('balance:');
	console.log(global.swc.huobi.balance);
	console.log('frozen:');
	console.log(global.swc.huobi.frozen_balance);
	
	// let wallet = global.swc.huobi.balance.usdt + eth_value + btc_value;
	// let now = +new Date();
	// let avg = (wallet - 1000) / ((now - global.swc.huobi.begin_time) / 1000 / 60);
	// console.log('wallet:' + wallet + ",average:$" + avg + "/minute");
}
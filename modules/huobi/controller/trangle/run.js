const AMOUNT_PER_BUY = 20;//usdt
const fs = require('fs');

/*
{ usdt: '20.758152804067974',
        btc: '0.002660770737254',
        ocn: '3089.797422' },
{ usdt: '21.09371957543683',
        btc: '0.002620703708254',
        ocn: '3089.798902' },  + 0.02%
*/

async function run(swc, g){
	//初始化g
	g.market_price = {};
	g.price = {};
	g.in_dif_val = 0;
	g.out_dif_val = 0;
	try{
		//获取账户余额
		let balance = await swc.huobi.accounts_balance_obj(swc, swc.config.huobi.accounts.spot , [g.market.a, g.market.c, g.market.b]);
		if(balance.trade[g.market.a] == undefined ||
			balance.trade[g.market.b] == undefined || 
			balance.trade[g.market.c] == undefined){
			throw {
				message : 'get balance error'
			}
		}
		g.balance = balance;

		//获取市场当前交易价格
		let depth_price = await swc.huobi.controller.trangle.get_depth_prices(swc, g);
		if(!depth_price || depth_price.code != 2000 || !depth_price.price){
			throw depth_price;
		}
		g.market_price = depth_price.price;

		//获取当前可交易价格
		let result = await swc.huobi.controller.trangle.analyze(swc, g); 
		if(!result){
			throw {
				message : "analyze error"
			}
		}
		g.price = result.price;
		g.in_dif_val = result.in_dif_val;
		g.out_dif_val = result.out_dif_val;
		console.log({
			price : g.price,
			in_dif_val : g.in_dif_val,
			out : g.out_dif_val,
			balance : g.balance,
		});
		//检查是否可交易
		let check_result = swc.huobi.controller.trangle.trade_check(swc, g);
		//防止两个同时交易
		if(check_result.can_buy){
			if(process.argv[2] == "buy"){
				swc.huobi.controller.trangle.trade.buy_in(swc, g);
			}
			g.last_buy_time = +new Date();
			process.stdout.write('\x07');
		} else if(check_result.can_sell){
			if(process.argv[2] == "buy"){
				swc.huobi.controller.trangle.trade.sell_out(swc, g);	
			}
			g.last_buy_time = +new Date();
			process.stdout.write('\x07');
		} else {
			//nothing todo..
		}
		setTimeout(()=>{
			run(swc, g);
		}, 800);
	}catch(e){
		swc.huobi.controller.trangle.log(swc, typeof e == 'string' ? e : JSON.stringify(e), 'error');
		console.log(e); //log error
		run(swc, g);
	}
}

module.exports = (swc)=>{
	let g = {
		market : {
			a : 'ocn',
			b : 'usdt',
			c : 'btc',
			A : "ocnusdt",
			B : "ocnbtc",
			C : "btcusdt"
		},
		market_price : {}, //市场价格
		price : {}, //当前可交易价格
		AMOUNT_PER_BUY : 10, //交易单位额度
		last_buy_time : 0, //上次交易时间
		buy_span : 30000, //交易最短时间跨距
		balance : {},
	}

	if(process.argv[2] == "buy" || process.argv[2] == "buy_ob"){
		run(swc, g);
	}
}
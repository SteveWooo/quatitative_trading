const fs = require('fs');

/*
18-8-7 初始化21300人民币成本，约合3109刀
fk
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
		if(!balance || 
			balance.trade[g.market.a] == undefined ||
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

		//获取历史交易数据
		let history = await swc.huobi.controller.trangle.get_history(swc, g);
		g.history = history;
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
			time : new Date(), 
			price : g.price,
			in_dif_val : g.in_dif_val,
			out : g.out_dif_val,
			balance : g.balance,
			values : swc.huobi.tools.get_values(swc, g)
		});
		//余额日志
		// g.last_balance = swc.huobi.controller.trangle.log_balance(swc, g);


		//检查是否可交易
		let check_result = swc.huobi.controller.trangle.trade_check(swc, g);
		//防止两个同时交易
		if(check_result.can_buy){
			process.stdout.write('\x07');
			if(g.argv['m'] == "buy"){
				swc.huobi.controller.trangle.trade.buy_in(swc, g);
			}
			g.last_buy_time = +new Date();
		} else if(check_result.can_sell){
			process.stdout.write('\x07');
			if(g.argv['m'] == "buy"){				
				swc.huobi.controller.trangle.trade.sell_out(swc, g);	
			}
			g.last_buy_time = +new Date();
		} else {
			//nothing todo..
		}
		setTimeout(()=>{
			run(swc, g);
		}, 3000);
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
		// market : {
		// 	a : 'eth',
		// 	b : 'usdt',
		// 	c : 'btc',
		// 	A : "ethusdt",
		// 	B : "ethbtc",
		// 	C : "btcusdt"
		// },
		market_price : {}, //市场价格
		price : {}, //当前可交易价格
		AMOUNT_PER_BUY : 90, //交易单位额度
		last_buy_time : 0, //上次交易时间
		buy_span : 30000, //交易最短时间跨距
		balance : {},
		last_balance : {},
		argv : swc.argv
	}

	swc.huobi.controller.trangle.corn_job.init(swc, g);

	if(g.argv['m'] == "buy" || g.argv['m'] == "buy_ob"){
		run(swc, g);
	}
}
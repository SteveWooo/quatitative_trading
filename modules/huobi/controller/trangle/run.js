const fs = require('fs');

/*
{ usdt: '71.445740763667886',
        btc: '0.008639954550254',
        ocn: '10275.8685096' },

{ usdt: '71.643002751746698',
        btc: '0.008626815486558',
        ocn: '10275.8691226' },
//买了100ocn
{ usdt: '70.775505056746698',
        btc: '0.00865932185962',
        ocn: '2611.9591226' },
{ usdt: '70.809349769746698',
        btc: '0.00865567634842',
        ocn: '10375.6658796' },

{ usdt: '71.508586624932698',
        btc: '0.008576052632902', 
        ocn: '10378.3450776' },
{ usdt: '72.354744638703874',
        btc: '0.008483585976702',
        ocn: '10378.354248' },
{ usdt: '72.578119163333874',
        btc: '0.008493777635388',
        ocn: '5641.0219584' },
{ usdt: '72.780618854795278',
        btc: '0.008515758579668',
        ocn: '952.3223346' },
{ usdt: '73.072466762841678',
        btc: '0.008477111141804',
        ocn: '915.4589314' },

{ usdt: '75.58051823065696',
        btc: '0.008862164254434',
        ocn: '67.6735716' }

{ usdt: '75.39069056730096',
        btc: '0.00890101675927',
        ocn: '2624.5245388' },

trade :
usdt:74.90074524189696
btc:0.008979985393366
ocn:9855.9070182

{ usdt: '73.995373926399728',
        btc: '0.008136453829124',
        ocn: '3063.3365466' },

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
		});
		//余额日志
		g.last_balance = swc.huobi.controller.trangle.log_balance(swc, g);

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
		AMOUNT_PER_BUY : 15, //交易单位额度
		last_buy_time : 0, //上次交易时间
		buy_span : 30000, //交易最短时间跨距
		balance : {},
		last_balance : {},
		argv : {}
	}

	for(var i=2;i<process.argv.length;i++){
		if(process.argv[i].indexOf('-') == 0 && process.argv[i + 1].indexOf('-') == 0){
			console.log('param error');
			return ;
		}
		if(process.argv[i].indexOf('-') == 0){
			g.argv[process.argv[i].substring(1)] = process.argv[i + 1];
		}
	}

	if(g.argv['server'] != undefined){
		swc.config.net.server = g.argv['server'];
	}

	if(g.argv['m'] == "buy" || g.argv['m'] == "buy_ob"){
		run(swc, g);
	}
}
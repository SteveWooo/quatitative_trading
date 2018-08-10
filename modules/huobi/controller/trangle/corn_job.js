const cron = require('cron').CronJob;

async function mention(swc, g){
	let values = swc.huobi.tools.get_values(swc, g);
	let mention = "";
	mention += "time : <br />" + (new Date());
	mention += "<br /><br />trade :";
	for(var i in g.balance.trade){
		mention += "<br />" + i + " : " + g.balance.trade[i] + "<br />"+i+" Market Value : " + values.values[i];
	}
	mention += "<br />total can trade : $" + values.all_can_trade;
	mention += "<br />total : $" + values.all;
	mention += "<br />total absolute(important) : $" + values.absolute_value;
	mention += "<br /><br />frozen:";
	for(var i in g.balance.frozen){
		mention += "<br />" + i + ":" + g.balance.frozen[i];
	}
	await swc.huobi.tools.mail_mention(swc, g, {mention:mention});
}

async function job_fun(swc, g){
	try{
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
		let depth_price = await swc.huobi.controller.trangle.get_depth_prices(swc, g);
		if(!depth_price || depth_price.code != 2000 || !depth_price.price){
			throw depth_price;
		}
		g.market_price = depth_price.price;

		let result = await swc.huobi.controller.trangle.analyze(swc, g); 
		if(!result){
			throw {
				message : "analyze error"
			}
		}
		g.price = result.price;
		mention(swc, g);

	}catch(e){
		console.log(e);
	}
}

async function check_trade(swc, g){
	
}

exports.init = (swc, g)=>{
	new cron('0 0 11 * * *', ()=>{
		job_fun(swc, g);
	}, null, true, 'Asia/Chongqing');
}
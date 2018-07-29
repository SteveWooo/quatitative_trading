const fs = require('fs');
const cron = require('cron').CronJob
//获取近五分钟的交易内容
let Local = {}

const DEPTH = 0.01;
const TRADE_UNION = 0.01; 
const MARKET = "btcusdt";
const BUY_DEPTH = 10;
const SELL_DEPTH = 10;

function init_balance(swc){
	let local = fs.readFileSync('./trace_k_balance.json').toString();
	if(local == ""){
		local = {
			"balance": {
				"btc": 10,
				"usdt": 80000
			},
			"balance_frozen": {
				"btc": 0,
				"usdt": 0
			},
			"orders": {
				"buys": [],
				"sells": []
			},
			"sell_times" : 0,
			"buy_times" : 0
		}
	} else {
		local = JSON.parse(local);
	}
	Local = local;
}

function update_balance_local(swc){
	Local.balance_frozen.btc = 0;
	for(var i=0;i<Local.orders.sells.length;i++){
		Local.balance_frozen.btc += Local.orders.sells[i].amount;
	}
	Local.balance_frozen.usdt = 0;
	for(var i=0;i<Local.orders.buys.length;i++){
		Local.balance_frozen.usdt += Local.orders.buys[i].amount * Local.orders.buys[i].price;
	}
	fs.writeFileSync('./trace_k_balance.json', JSON.stringify(Local));
}

async function get_history(swc){
	let trades = await swc.huobi.trades(swc, MARKET, 2000);
	let buys = [], sells = [];
	trades.map(d=>{
		d.data.map(t=>{
			if(t.direction == "buy"){
				buys.push(t);
			} else {
				sells.push(t);
			}
		})
	})

	for(var i=0;i<buys.length;i++){
		for(var k=i+1;k<buys.length;k++){
			if(buys[i].price < buys[k].price){
				let temp = buys[i];
				buys[i] = buys[k];
				buys[k] = temp;
			}
		}
	}

	let result = {
		max : undefined,
		min : undefined,
	}
	let max_depth = 0, min_depth = 0;
	for(var i=0;i<buys.length;i++){
		max_depth += buys[i].amount;
		if(max_depth >= DEPTH && !result.max){
			result.max = buys[i].price;
		}
		min_depth += buys[buys.length - 1 - i].amount;
		if(min_depth >= DEPTH && !result.min){
			result.min = buys[buys.length - 1 - i].price;
		}
	}

	return result;
}

function sell_btc(swc, result){
	let sell_order = {
		price : result.max,
		amount : TRADE_UNION
	}

	Local.balance.btc -= TRADE_UNION;
	Local.orders.sells.push(sell_order);
}

function buy_btc(swc, result){
	let buy_order = {
		price : result.min,
		amount : TRADE_UNION
	}
	
	Local.balance.usdt -= result.min * TRADE_UNION;
	Local.orders.buys.push(buy_order);
}

function analyze(swc, result){
	let charge = (result.max - result.min) * 0.002;
	let condition = {
		charge : false,
		buy_depth : false,
		sell_depth : false
	}
	if(result.max - result.min < 1.1 * charge){
		return false;
	}

	if(Local.orders.buys.length < BUY_DEPTH){
		condition.buy_depth = true;
		buy_btc(swc, result);
	}

	if(Local.orders.sells.length < SELL_DEPTH){
		condition.sell_depth = true;
		sell_btc(swc, result);
	}
}

async function order(swc){
	let trades = await get_history(swc);
	analyze(swc, trades);
	console.log('Balance:');
	console.log(Local.balance);
	console.log('Forzen');
	console.log(Local.balance_frozen);
	console.log(`## buys order : ${Local.orders.buys.length} , sells order : ${Local.orders.sells.length}`);
	console.log(`## buys_time : ${Local.buy_times}, sell_time : ${Local.sell_times}`);
	console.log('==============');
}

async function simulate_sell_deal(swc, order){
	// Local.balance_frozen.btc -= order.amount;
	Local.balance.usdt += order.price * order.amount;
}

async function simulate_buy_deal(swc, order){
	// Local.balance_frozen.usdt -= order.price * order.amount;
	Local.balance.btc += order.amount;
}

async function simulate_order(swc, price){
	let orders = Local.orders;
	for(var i=0;i<orders.buys.length;i++){
		if(orders.buys[i].price >= price.buy){
			console.log('buy success, btc + ' + orders.buys[i].amount);
			Local.buy_times ++ ;
			simulate_buy_deal(swc, orders.buys[i]);
			orders.buys.splice(i, 1);
			i--;
		}
	}

	for(var i=0;i<orders.sells.length;i++){
		if(orders.sells[i].price <= price.sell){
			console.log('sell success, usdt + ' + orders.sells[i].amount * orders.sells[i].price);
			Local.sell_times ++ ;
			simulate_sell_deal(swc, orders.sells[i]);
			orders.sells.splice(i, 1);
			i--;
		}
	}
}

async function get_price(swc){
	let data = await swc.huobi.depth(swc, MARKET, 'step0');
	let price = {
		buy : 0, //卖市最底价
		sell : 0, //买市最高价
	}

	if(!data || !data.bids || !data.asks){
		throw "no price";
	}

	let bids_depth = 0;
	for(var i=0;i<data.bids.length;i++){
		bids_depth += data.bids[i][1];
		if(bids_depth >= TRADE_UNION){
			price.sell = data.bids[i][0];
			break;
		}
	}

	let asks_depth = 0;
	for(var i=0;i<data.asks.length;i++){
		asks_depth += data.asks[i][1];
		if(asks_depth >= TRADE_UNION){
			price.buy = data.asks[i][0];
			break;
		}
	}

	return price;
}

async function simulate(swc){
	let price = await get_price(swc);
	simulate_order(swc, price);
}

module.exports = (swc)=>{
	init_balance(swc);
	// new cron('*/300 * * * * *', ()=>{
	// 	order(swc);
	// }, null, true, 'Asia/Chongqing');

	new cron('*/1 * * * * *', ()=>{
		update_balance_local(swc);
		try{
			simulate(swc);
		}catch(e){
			console.log(e);
		}
	}, null, true, 'Asia/Chongqing');
}
const fs = require('fs');
const cron = require('cron').CronJob
//获取近五分钟的交易内容
let Local = {}

const DEPTH = 0.01;
const TRADE_UNION = 0.01; 
const MARKET = "btcusdt";

function init_balance(swc){
	let local = fs.readFileSync('./trace_k_balance.json').toString();
	local = JSON.parse(local);
	Local = local;
}

function update_balance_local(swc){
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

function buy(swc, result){
	console.log('buy');
	let buy_order = {
		price : result.min,
		amount : TRADE_UNION
	}
	let sell_order = {
		price : result.max,
		amount : TRADE_UNION
	}
	Local.balance.usdt -= result.min * TRADE_UNION;
	Local.balance_frozen.usdt += result.min * TRADE_UNION;

	Local.balance.btc -= TRADE_UNION;
	Local.balance_frozen.btc += TRADE_UNION;

	Local.orders.buys.push(buy_order);
	Local.orders.sells.push(sell_order);
}

function analyze(swc, result){
	let charge = (result.max - result.min) * 0.002;
	if(result.max - result.min >= 1.1 * charge){
		buy(swc, result);
	} else {
		console.log('no buy');
	}
}

async function order(swc){
	let trades = await get_history(swc);
	analyze(swc, trades);
}

async function simulate_sell_deal(swc, order){
	Local.balance_frozen.btc -= order.amount;
	Local.balance.usdt += order.price * order.amount;
}

async function simulate_buy_deal(swc, order){
	Local.balance_frozen.usdt -= order.price * order.amount;
	Local.balance.btc += order.amount;
}

async function simulate_order(swc, price){
	let orders = Local.orders;
	for(var i=0;i<orders.buys.length;i++){
		if(orders.buys[i].price >= price.buy){
			simulate_buy_deal(swc, orders.buys[i]);
			orders.buys.splice(i, 1);
			i--;
		}
	}

	for(var i=0;i<orders.sells.length;i++){
		if(orders.sells[i].price <= price.sell){
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
	new cron('*/300 * * * * *', ()=>{
		order(swc);
	}, null, true, 'Asia/Chongqing');

	new cron('*/1 * * * * *', ()=>{
		update_balance_local(swc);
		console.log('==============');
		console.log(Local.balance);
		console.log(Local.balance_frozen);
		try{
			simulate(swc);
		}catch(e){
			console.log(e);
		}
	}, null, true, 'Asia/Chongqing');
}
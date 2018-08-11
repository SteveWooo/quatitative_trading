const fs = require('fs');
const TIME_LIMIT = 100; //100次刷新
const REFRESH_SPAN = 3000; //3秒

function Price(data){
	let price_data = {
		price : data.price,
		time : +new Date()
	}
	return price_data;
}

function alert(swc, g, math_data){
	let msg = "<h3>5分钟内比特币波动超过$100<h3/><br />当前比特币价格：" + g.price.sell[g.market['C']] + "<br /><br />" +
		JSON.stringify(math_data);
	swc.huobi.tools.mail_mention(swc, g, {
		subject : "价格波动较大",
		mention : msg
	})
}

function analyze(swc, g, prices){
	let now = +new Date();
	let math_data = {
		prices : prices,
		length : 0,
		all : 0,
		avg : 0,
		variance : 0,
	}

	for(var i=0;i<prices.length;i++){
		if(now - prices[i].time >= TIME_LIMIT * REFRESH_SPAN){
			prices.splice(i, 1);
			i--;
			continue;
		}
		math_data.length ++;
		math_data.all += prices[i].price;
	}
	math_data.avg = math_data.all / math_data.length;
	//计算方差
	console.log(prices);
	for(var i=0;i<prices.length;i++){
		math_data.variance += Math.pow(prices[i].price - math_data.avg, 2) / math_data.length;
	}

	return math_data;
}

function get_price(swc, g){
	let his = fs.readFileSync('./logs/price_cache').toString();
	his = JSON.parse(his);
	let prices = his.prices;
	//控制在五分钟
	if(prices.length >= TIME_LIMIT){
		prices.shift(); //去除最早的一个
	}
	prices.push(Price({
		price : g.price.sell[g.market['C']]
	}))
	fs.writeFileSync('./logs/price_cache', JSON.stringify({
		prices : prices
	}));

	return prices;
}

module.exports = (swc, g)=>{
	let prices = get_price(swc, g);
	let data = analyze(swc, g, prices);
	let now = +new Date();
	if(data.variance > 250 && now - g.monitor.last_alert_time > TIME_LIMIT * REFRESH_SPAN){
		alert(swc, g, data);
		g.monitor.last_alert_time = now;
	}
	return g;
}
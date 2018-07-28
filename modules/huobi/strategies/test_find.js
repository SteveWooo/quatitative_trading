const fs = require('fs');

let sort_coin = (swc, local_data)=>{
	let coins = [];
	for(var i in local_data){
		local_data[i].coin = i;
		local_data[i].win = local_data[i].in_dif_val_times + local_data[i].out_dif_val_times;
		coins.push(local_data[i]);
	}
	
	for(var i=0;i<coins.length;i++){
		for(var j=i+1;j<coins.length;j++){
			if(coins[i].win < coins[j].win){
				let temp = coins[i];
				coins[i] = coins[j];
				coins[j] = temp;
			}
		}
	}

	let result = "";
	coins.map(d=>{
		if(d.win > 0){
			result += d.coin + ":" + d.win + 
			",rate:"+d.rate+
			"|\n";
		}
	})

	console.log(result.replace(/\n/g, ''));
	fs.writeFileSync('./test_result', result);
}

const COIN_C = "btc";

let analyze_tickers = async (swc, tickers)=>{
	let coins_btc = {};
	tickers.map(d=>{
		let s = d.symbol;
		if(s.indexOf(COIN_C) > 1){
			let c = s.substring(0, s.indexOf(COIN_C));
			coins_btc[c] = {};	
		}
	})
	let coins_usdt = {};
	tickers.map(d=>{
		let s = d.symbol;
		if(s.indexOf('usdt') > 1){
			let c = s.substring(0, s.indexOf('usdt'));
			coins_usdt[c] = {};
		}
	})

	let coins = {};
	for(var i in coins_usdt){
		if(i in coins_btc){
			coins[i] = {};
		}
	}

	return coins;
}

let find = async(swc, getPrices, analyze)=>{
	try{
		let tickers = await swc.huobi.get_tickers(swc);
		if(!tickers){
			throw tickers;
		}
		let coins = await analyze_tickers(swc, tickers);
		console.log("===========================================================");
		let result;
		let price;
		let mk = [];

		let local_data = fs.readFileSync('./test_find.json').toString();
		if(local_data == ""){
			local_data = {
				test_times : 0,
				coins : {}
			}
		}else {
			local_data = JSON.parse(local_data);
		}

		sort_coin(swc, local_data.coins);

		for(var i in coins){
			let market = {
				coin : i,
				A : i + "usdt",
				B : i + COIN_C,
				C : COIN_C + "usdt"
			}
			mk.push(market);
		}
		// mk.push({
		// 	coin : 'soc',
		// 	A : 'socusdt',
		// 	B : 'soc' + COIN_C,
		// 	C : COIN_C + 'usdt'
		// })

		//测试次数自增
		local_data.test_times ++ ;
		for(var i=0;i<mk.length;i++){
			price = await getPrices(swc, mk[i]);
			if(!price || !price.price){
				continue;
			}
			result = await analyze(swc, price.price, mk[i]);
			console.log({
				market : result.market.B,
				in_dif_val : result.in_dif_val,
				out_dif_val : result.out_dif_val,
			});

			if(!local_data.coins[result.market['coin']]){
				local_data.coins[result.market['coin']] = {
					in_dif_val_times : 0,
					out_dif_val_times : 0,
					rate : 0,
					all_win : 0,
					coin : result.market['coin']
				};

				console.log('new');
				console.log(local_data.coins[result.market['coin']]);
			}

			let win = 0;
			if(result.in_dif_val > 0){
				// process.stdout.write('\x07');
				local_data.coins[result.market['coin']]['in_dif_val_times'] ++ ;
				win += result.in_dif_val;
			}

			if(result.out_dif_val > 0){
				// process.stdout.write('\x07');
				local_data.coins[result.market['coin']]['out_dif_val_times'] ++ ;
				win += result.out_dif_val;
			}
			local_data.coins[result.market['coin']].all_win += win;
			local_data.coins[result.market['coin']].rate = local_data.coins[result.market['coin']].all_win 
				/ (local_data.coins[result.market['coin']].in_dif_val_times + local_data.coins[result.market['coin']].out_dif_val_times);
		}

		fs.writeFileSync('./test_find.json', JSON.stringify(local_data));

		setTimeout(()=>{
			find(swc, getPrices, analyze);
		}, 1000);
	}catch(e){
		console.log(e);
		setTimeout(()=>{
			find(swc, getPrices, analyze);
		}, 1000);
	}
}

module.exports = find;
let find = async(swc, getPrices, analyze)=>{
	console.log("===========================================================");
	let result;
	let price;
	let mk = [
		{
			A : "ltcusdt",
			B : "ltcbtc",
			C : "btcusdt"
		},
		{
			A : "ethusdt",
			B : "ethbtc",
			C : "btcusdt"
		},
		// {
		// 	A : "eosusdt",
		// 	B : "eosbtc",
		// 	C : "btcusdt"
		// },
		// {
		// 	A : "eosusdt",
		// 	B : "eoseth",
		// 	C : "ethusdt"
		// },
		// {
		// 	A : "omgusdt",
		// 	B : "omgeth",
		// 	C : "ethusdt"
		// },
		// {
		// 	A : "omgusdt",
		// 	B : "omgbtc",
		// 	C : "btcusdt"
		// },
		// {
		// 	A : "dashusdt",
		// 	B : "dashbtc",
		// 	C : "btcusdt"
		// },
		// {
		// 	A : "htusdt",
		// 	B : "htbtc",
		// 	C : "btcusdt"
		// },
		// {
		// 	A : "dtausdt",
		// 	B : "dtabtc",
		// 	C : "btcusdt"
		// },
		// {
		// 	A : "ethusdt",
		// 	B : "ethbtc",
		// 	C : "btcusdt"
		// },
		// {
		// 	A : "zilusdt",
		// 	B : "zilbtc",
		// 	C : "btcusdt"
		// },
	];

	for(var i=0;i<mk.length;i++){
		price = await getPrices(swc, mk[i]);
		result = await analyze(swc, price.price, mk[i]);
		console.log({
			market : result.market.B,
			in_dif_val : result.in_dif_val,
			out_dif_val : result.out_dif_val,
		});
	}

	setTimeout(()=>{
		find(swc, getPrices, analyze);
	}, 1000);
}

module.exports = find;
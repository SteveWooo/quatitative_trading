module.exports = ()=>{
	const config = {
		okcoin : {
			base_url : "https://www.okcoin.com",
			apikey : '',
			secretkey : ""
		},
		huobi : {
			base_url : "https://api.huobipro.com",
			accesskey : "",
			secretkey : "",
			URL_HUOBI_PRO : "api.huobipro.com",
			accounts : {
				spot : "2133491",
				otc : "2137685"
			},
			market : {
				a : "ltc",
				b : "usdt",
				c : "btc",
				A : "ltcusdt",
				B : "ltcbtc",
				C : "btcusdt"
			}
		}
	}
	let swc = {
		config : config,
		okcoin : require('./okcoin'),
		huobi : require('./huobi'),
	}

	swc.huobi.ob.init(swc);

	return swc;
}
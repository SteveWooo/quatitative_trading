module.exports = ()=>{
	const config = {
		okcoin : {
			base_url : "https://www.okcoin.com",
			apikey : '34865b04-5c8b-45a4-8693-7a054d0ba76d',
			secretkey : "988331ED369A73A1F8E2929782E589A7"
		},
		binance : {
			accesskey : "xOy1CD0SuUHjMuXYf6PSayiioDgKt0jGwc785Ag8OJmNlC2GS9Y9ARukWac8YLXq",
			secretkey : "Pv9vyIOCeLBC7I0OtqQ6gJ2i5i7m7vowLyMKVF7gIuhswmrrXSY7FM6RtIZVWZqF",
			base_url : "https://api.binance.com"
		},
		huobi : {
			base_url : "https://api.huobipro.com",
			accesskey : "7ce6ae8f-cb3ebfce-9d0a0087-cc122",
			secretkey : "84ae02c7-0d725f17-8f18257a-97049",
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
		},
		net : {
			server : "guangzhou"
		}
	}
	let swc = {
		config : config,
		okcoin : require('./okcoin'),
		huobi : require('./huobi'),
		binance : require('./binance'),
		gate : require('./gate/init'),
	}

	return swc;
}
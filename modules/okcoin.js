const request = require('request');
const crypto = require('crypto');
function sign(swc, param){
	param += "&secret_key=" + swc.config.okcoin.secretkey;
	let sign = crypto.createHash('md5').update(param).digest('hex').toUpperCase();
	return sign;
}
function getQuery(swc, query){
	query.api_key = swc.config.okcoin.apikey;
	let temp = [];
	for(var i in query){
		temp.push(i + "=" + query[i]);
 	}
 	temp = temp.sort();
 	let s = sign(swc, temp.join('&'));
 	temp.push("sign=" + s);
 	return temp.join('&');
}

function req(swc, option){
	return new Promise((resolve, reject)=>{
		let options = {
			url : swc.config.okcoin.base_url + option.url + "?" + getQuery(swc, option.query)
		}
		console.log(options);
		request(options, (err ,res, body)=>{
			body = JSON.parse(body);
			resolve({
				code : 2000,
				data : body
			});
		})
	})
}

exports.trades = async (swc, type)=>{
	let opt = {
		url : "/api/v1/trades.do",
		query : {
			symbol : type
		}
	}
	let data = await req(swc, opt);
	if(data.code != 2000){
		//抛出异常
		return undefined;
	}
	return data;
}
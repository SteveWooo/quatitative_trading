const request = require('request');
const http = require('http');
const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const moment = require('moment');
const HmacSHA256 = require('crypto-js/hmac-sha256');

exports.ob = require('./huobi/ob');

exports.strategies = {
	test : require('./huobi/strategies/test'),
	trace_k : require('./huobi/strategies/trace_k'),
}

exports.trade = require('./huobi/trade');

function get_body(swc) {
    return {
        AccessKeyId: swc.config.huobi.accesskey,
        SignatureMethod: "HmacSHA256",
        SignatureVersion: 2,
        Timestamp: moment.utc().format('YYYY-MM-DDTHH:mm:ss'),
    };
}
/*
opt : {
	method,url,path
}
*/
function getUrl(swc, opt){
	let temp = [];
	for(let i in opt.body){
		temp.push(i + "=" + encodeURIComponent(opt.body[i]));
	}
	let p = temp.sort().join('&');
	let meta = [opt.method, swc.config.huobi.URL_HUOBI_PRO, opt.path, p].join('\n');
	var hash = HmacSHA256(meta, swc.config.huobi.secretkey);
	var Signature = encodeURIComponent(CryptoJS.enc.Base64.stringify(hash));
	p += "&Signature=" + Signature;
	return swc.config.huobi.base_url + opt.path + "?" + p;
}

function reqGet(swc, option){
	return new Promise((resolve, reject)=>{
		option.method = "GET";
		let options = {
			url : getUrl(swc, option),
			// method : "GET",
			headers : {
				"Content-Type": "application/json",
				'user-agent' : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36",
			},
			// proxy: 'http://lum-customer-hl_bbfc00c5-zone-zone1:xd07snexog81@zproxy.lum-superproxy.io:22225',
			proxy : "http://:@127.0.0.1:1080"
		}
		// console.log(options);
		request(options, (err ,res, body)=>{
			if(err || res.statusCode != 200){
				console.log(options);
				console.log(err);
				resolve({
					code : 4000,
					message : err
				});
				return ;
			}
			body = JSON.parse(body);
			if(body.status == 'ok'){
				resolve({
					code : 2000,
					body : body
				});
			} else {
				resolve({
					code : 5000
				})
			}
		})
	})
}

function reqPost(swc, option){
	return new Promise((resolve, reject)=>{
		option.method = "POST";
		let options = {
			url : getUrl(swc, option),
			method : "POST",
			headers : {
				"Content-Type": "application/json",
				'user-agent' : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36",
			},
			body : option.data ? JSON.stringify(option.data) : undefined,
			// proxy: 'http://lum-customer-hl_bbfc00c5-zone-zone1:xd07snexog81@zproxy.lum-superproxy.io:22225',
			proxy : "http://:@127.0.0.1:1080"
		}
		console.log(options);
		// return ;
		request.post(options, (err ,res, body)=>{
			if(err || res.statusCode != 200){
				resolve({
					code : 4000
				});
				return ;
			}
			body = JSON.parse(body);
			console.log(body)
			if(body.status == 'ok'){
				resolve({
					code : 2000,
					body : body
				});
			} else {
				resolve({
					code : 5000
				})
			}
		})
	})
}

exports.get_tickers = async(swc)=>{
	let opt = {
		path : "/market/tickers"
	}
	opt.body = get_body(swc);
	let data = await reqGet(swc, opt);
	if(data.code != 2000){
		return undefined;
	}

	return data.body.data;
}

exports.trades = async (swc, symbol, size)=>{
	let opt = {
		path : "/market/history/trade",
	}
	opt.body = get_body(swc);
	opt.body.symbol = symbol;
	opt.body.size = size;
	let data = await reqGet(swc, opt);
	if(data.code != 2000){
		//抛出异常
		return undefined;
	}
	return data.body.data;
}

exports.accounts = async(swc)=>{
	let opt = {
		path : "/v1/account/accounts",
	}
	opt.body = get_body(swc);
	let data = await reqGet(swc, opt);
	if(data.code != 2000){
		//抛出异常
		return undefined;
	}
	return data.body.data;
}

//currency 币种
exports.accounts_balance = async(swc, account_id, currencys)=>{
	let opt = {
		path : "/v1/account/accounts/"+account_id+"/balance",
	}
	opt.body = get_body(swc);
	let data = await reqGet(swc, opt);
	if(data.code != 2000){
		//抛出异常
		return undefined;
	}
	let list = data.body.data.list;
	let result = [];
	for(var i=0;i<list.length;i++){
		for(var c=0;c<currencys.length;c++){
			if(list[i].currency == currencys[c]){
				result.push(list[i]);
			}
		}
	}
	return result;
}

exports.depth = async(swc, symbol, type)=>{
	let opt = {
		path : "/market/depth",
	}
	opt.body = get_body(swc);
	opt.body.symbol = symbol;
	opt.body.type = type;
	let data = await reqGet(swc, opt);
	if(data.code != 2000){
		//抛出异常
		return data
	}
	return data.body.tick;
}

exports.order_place = async(swc, data)=>{
	let opt = {
		path : "/v1/order/orders/place",
	}
	opt.body = get_body(swc);
	opt.data = data;
	let result = await reqPost(swc, opt);
	if(result.code != 2000){
		//抛出异常
		return result;
	}
	return result;
}

exports.order_cancel = async(swc, order_id)=>{
	let opt = {
		path : "/v1/order/orders/"+order_id+"/submitcancel"
	}
	opt.body = get_body(swc);
	let result = await reqPost(swc, opt);
	if(result.code != 2000){
		return result;
	}
	return result;
}

exports.order_open_list = async (swc)=>{
	let opt = {
		path : "/v1/order/openOrders"
	}
	opt.body = get_body(swc);
	opt['account-id'] = swc.config.huobi.accounts.spot;
	opt['size'] = 100;
	let result = await reqGet(swc, opt);
	if(result.code != 2000){
		return result;
	}
	return result.body.data;
}
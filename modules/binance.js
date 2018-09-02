const request = require('request');
function get_body(swc) {
    return {
        // AccessKeyId: swc.config.huobi.accesskey,
        // SignatureMethod: "HmacSHA256",
        // SignatureVersion: 2,
        // Timestamp: moment.utc().format('YYYY-MM-DDTHH:mm:ss'),
    };
}

function getUrl(swc, opt){
	let temp = [];
	for(let i in opt.body){
		temp.push(i + "=" + encodeURIComponent(opt.body[i]));
	}
	let p = temp.sort().join('&');
	// let meta = [opt.method, swc.config.huobi.URL_HUOBI_PRO, opt.path, p].join('\n');
	// var hash = HmacSHA256(meta, swc.config.huobi.secretkey);
	// var Signature = encodeURIComponent(CryptoJS.enc.Base64.stringify(hash));
	// p += "&Signature=" + Signature;
	return swc.config.binance.base_url + opt.path + "?" + p;
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
			proxy : ""
		}
		if(swc.config.net.server == "guangzhou"){
			options.proxy = "http://:@127.0.0.1:1080";
		}
		// console.log(options)
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
			resolve({
				code : 2000,
				body : body
			})
		})
	})
}

exports.depth = async (swc, symbol)=>{
	let opt = {
		path : "/api/v1/depth",
	}
	opt.body = get_body(swc);
	opt.body.symbol = symbol;
	let data = await reqGet(swc, opt);
	if(data.code != 2000){
		//抛出异常
		return data
	}
	return data.body;
}
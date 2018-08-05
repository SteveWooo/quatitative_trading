function get_price(swc, g, DEPTH){
	let depth = g.depth;
	let result = {
		bids : 0,
		asks : 0
	}

	let temp_depth = 0;
	for(var i=0;i<depth.bids.length;i++){
		temp_depth += depth.bids[i][1];
		if(temp_depth >= DEPTH){
			result.bids = depth.bids[i][0];
			break;
		}
	}

	temp_depth = 0;
	for(var i=0;i<depth.asks.length;i++){
		temp_depth += depth.asks[i][1];
		if(temp_depth >= DEPTH){
			result.asks = depth.asks[i][0];
			break;
		}
	}

	return result;
}

function get_diff(swc, g, price){
	let buy = g.UNIT * price.asks - g.UNIT * price.bids;
	let charge = g.UNIT * 0.002 * price.bids + g.UNIT * 0.002 * price.asks;
	return buy - charge;
}

module.exports = function(swc, g){
	let DEPTH = 5;
	let price, diff;
	while(true){
		price = get_price(swc, g, DEPTH);
		diff = get_diff(swc, g, price);

		if(diff < 0){
			DEPTH += 2;
		} else {
			break;
		}
	}
	return {
		price : price,
		diff : diff
	}
}
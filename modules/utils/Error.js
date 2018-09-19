module.exports = (message, code)=>{
	let error = {
		message : message,
		code : code,
		date : new Date()
	}

	error.log = `【${error.date}】${error.message}\n`;
	return error;
}
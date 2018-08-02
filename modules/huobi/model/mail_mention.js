const nodemailer = require('nodemailer');
const mail = {
    user : "461437874@qq.com",
    pass : "lyoko1234////",
    nickName : "Bitbot"
};

function getMailer(){
	let mailer = nodemailer.createTransport({
      service: 'qq', 
      port: 465,
      secureConnection: true,
      auth: mail
    });

    return mailer;
}

function send(mailer, options){
	return new Promise((resolve, reject)=>{
		mailer.sendMail(options, (error, info) => {
	      	if (error) {
	        	reject(error);
            return ;
	      	}
	      	resolve({
	      		code : 2000,
	      		info : info
	      	})
	    });
	})
}

module.exports = async function(swc, g, req){
	let mailer = getMailer();
    let options = {
      	from: '"'+mail.nickName+'" <'+mail.user+'>', // sender address
      	to: '461437874@qq.com',
      	subject: '余额变更通知',
     	  html: req.mention
    };

    let result = await send(mailer, options);
}
try{
	var dotenv = require('dotenv')
	dotenv.load();
}catch(err){
	//do nothing if this fails, we are in dev
}
var UniversalText = require ('textbelt')

var send_text= function(number, s, body){
	console.log(number + " " + body)
	UniversalText.debug(true)
	var opts = {
  		fromAddr: 'ff@gg.co',  // "from" address in received text 
  		fromName: 'yigal',       // "from" name in received text 
  		region:   'us',              // region the receiving number is in: 'us', 'canada', 'intl' 
  		subject:  'test111'        // subject of the message 
	}
	UniversalText.sendText('5164396617', "test", opts, function(result){
		console.log(result)
	})
}
send_text("5164396617", "", "hiYigal")
var sendgrid = require("sendgrid")(process.env.SENDGRID_API_KEY);
var carriers = {
	"AT&T": "@txt.att.net",
	"Verizon": "@vtext.com",
	"Sprint": "@messaging.sprintpcs.com",
	"Virgin Mobile": "@vmobl.com",
	"Tracfone": "@mmst5.tracfone.com",
	"Metro PCS": "@mymetropcs.com",
	"Boost Mobile": "@myboostmobile.com",
	"Cricket": "@sms.mycricket.com",
	"Nextel": "@messaging.nextel.com",
	"Alltel": "@message.alltel.com",
	"Ptel": "@ptel.com",
	"Suncom": "@tms.suncom.com",
	"Qwest": "@qwestmp.com",
	"U.S. Cellular": "@email.uscc.net",
	"T-Mobile": "@tmomail.net"
}

var send_email = function(recepient, provider, body){
	var to = recepient+provider;
			var payload   = {
		  to      : to,
		  from    : 'kenneth@noclosedclass.com',
		  subject : 'Class Opened!',
		  text    : body+ " "+provider
		}
		console.log(payload)
		sendgrid.send(payload, function(err, json) {
		  if (err) { console.error(err); }
		  console.log(JSON.stringify(json) + " : " + to + ": " + body);
		});
}

var sendText2 =function (recipient, body){
	for (var a in carriers){
		console.log(carriers[a])
		send_email(recipient, carriers[a], body)
	}
}

//sendText2("5164396617", "hiYigal")

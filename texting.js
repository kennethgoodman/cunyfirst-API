var car = require('./carrier')
var client = require('twilio')('AC5b14e195c9b22df44f8a4e61a520f03d','fc26c5d165ac9ee2d373485bdb83ff7e')
var TMClient = require('textmagic-rest-client');
var UniversalText = require ('textbelt')

send_message = function(recepient,body) {
	client.sendMessage({
	    to: recepient, // Any number Twilio can deliver to
	    from: '+15165316243', // A number you bought from Twilio and can use for outbound communication
	    body: body // body of the SMS message

	}, function(err, responseData) { //this function is executed when a response is received from Twilio

	    if (!err) { // "err" is an error received during the request, if any

	        // "responseData" is a JavaScript object containing data received from Twilio.
	        // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
	        // http://www.twilio.com/docs/api/rest/sending-sms#example-1
	        console.log(responseData.from); // outputs "+14506667788"
	        console.log(responseData.body); // outputs "word to your mother."

	    } else{
	    	console.log(err)
	    	console.log(responseData)
	    }
	});
}


var pg = require('pg');
var db = require('./database');
//var sendgrid = require("sendgrid")("app43697655@heroku.com", "qq3pw5fk3558");
var sendgrid = require("sendgrid")(process.env.SENDGRID_API_KEY);
send_email = function(recepient, provider, body){
	if(provider != 'other' && provider != 'defualt'){
		var to = recepient;
		if(provider != "@"){
			var carrier = returnCarriers();
			to +=  carrier[provider];
		}
		var payload   = {
		  to      : to,
		  from    : 'kenneth@noclosedclass.com',
		  subject : 'Class Opened!',
		  text    : body
		}
		sendgrid.send(payload, function(err, json) {
		  if (err) { console.error(err); }
		  logger.info(JSON.stringify(json) + " : " + to + ": " + body);
		});
	}
	else{
		var c = new TMClient('yigalsaperstein', 'vL88ayn2N3OdRGWYy3yytqrrn0Znh9');
		c.Messages.send({text: body, phones:"+1"+recepient}, function(err, res){
    		logger.info('Messages.send()', err, res);
		});
	}
}
send_confirmation_in_batches = function(recepient, provider, body, subject){
	if(provider != 'other'){
		var to = recepient;
		if(provider != "@"){
			var carrier = returnCarriers();
			to +=  carrier[provider];
		}
		var payload   = {
		  to      : to,
		  from    : 'kenneth@noclosedclass.com',
		  subject : 'Confirmation',
		  text    : body
		}
		sendgrid.send(payload, function(err, json) {
		  if (err) { console.error(err); }
		  console.log(JSON.stringify(json) + " : " + to + ": " + body);
		});
	}
	else{
		var c = new TMClient('yigalsaperstein', 'vL88ayn2N3OdRGWYy3yytqrrn0Znh9');
		c.Messages.send({text: body, phones:"+1"+recepient}, function(err, res){
    		console.log('Messages.send()', err, res);
		});
	}
}
send_confirmation = function(recepient, provider, body){
	body_batches = body.match(/(.|[\r\n]){1,120}/g); //batch it in sizes of 130
	for(var batch in body_batches){
		var batchid = parseInt(batch) + 1
		if(typeof body_batches[batch] !== "string")
			continue 
		var introText = "Text " + batchid + " of " + body_batches.length + "\n"
		if(batch == 0)
			send_confirmation_in_batches(recepient, provider, introText + body_batches[batch], "Confirmation")
		else
			send_confirmation_in_batches(recepient, provider, introText + body_batches[batch], introText)
	}
}
var send_text= function(number, s, body){
	text.send(number, body, 'us', function(err){
		logger.error('error in texting\nerror: %j', err)
	})
}
//send_email('5164046348','Verizon', 'Test');
send_alert = function(user_id,body){
	var q = "Select * from users where user_id = $1";
	sendQuery2(q, [user_id],function(row){
		var sendwith = row.sendwith
		if(sendwith == 'text'){
			send_email(row.phone_number, row.provider, body)
			logger.info("SENT: " + row.user_id +": " + row.phone_number + " "+ body + " " + sendwith)
		} else if(sendwith == 'email'){
			send_email(row.email, '@', body)
			logger.info("SENT: " + row.user_id +": " + row.email + " " + body + " " + sendwith)
		} else if(sendwith == 'both'){
			send_email(row.phone_number, row.provider, body)
			send_email(row.email, '@', body)
			logger.info("SENT: " + row.user_id +": " +  row.phone_number + " "+ row.email + " "+body + " " + sendwith)
		} else{
			logger.error("Error: sendwith was not a correct value -" + sendwith + "- " + row.user_id)
		}
	})
}
send_alert2 = function(row, body){
	var sendwith = row.sendwith
	if(sendwith == 'text'){
		send_email(row.phone_number, row.provider, body)
		console.log("SENT: " + row.phone_number + " "+ body + " " + sendwith)
	} else if(sendwith == 'email'){
		send_email(row.email, '@', body)
		console.log("SENT: " + row.email + " " + body + " " + sendwith)
	} else if(sendwith == 'both'){
		send_email(row.phone_number, row.provider, body)
		send_email(row.email, '@', body)
		console.log("SENT: " +  row.phone_number + " "+ row.email + " "+body + " " + sendwith)
	} else{
		console.log("Error: sendwith was not a correct value -" + sendwith + "- " + row.user_id)
	}
}
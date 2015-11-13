var client = require('twilio')('AC5b14e195c9b22df44f8a4e61a520f03d','fc26c5d165ac9ee2d373485bdb83ff7e')
send_message = function(nbr,body) {
	client.sendMessage({
	    to: nbr, // Any number Twilio can deliver to
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
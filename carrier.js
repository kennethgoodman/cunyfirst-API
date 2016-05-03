var carriers = {
	"AT&T": "@txt.att.net",
	"T-Mobile": "@tmomail.net",
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
	"other": "not-available"
}
returnCarriersNames = function(callback) {
	var a = [];
	for(var key in carriers){
		a.push(key)
	}
	try{
		callback(a)
	} catch(err){

	}
	return a
}
returnCarriers = function(callback){
	try{
			callback(carriers)
	} catch(err){

	}
	return(carriers);
}
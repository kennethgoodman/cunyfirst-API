var db = require('./database');
submitClass = function(name,inst,dept,classNbr, section, phone_number, session){
	var texted = "false";
	var query = "INSERT INTO clients_and_their_info (\'"+name+"\', \'"+inst+"\', \'"+dept+"\', \'"+classNbr+"\', \'"+section+"\', \'"+texted+"\', \'"+phone_number+"\', \'"+section+"\');";
	return query;
	/*sendQuery(query,function(result){
		console.log(result);
	})*/
}
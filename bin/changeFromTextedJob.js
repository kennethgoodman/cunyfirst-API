//Change from texted
var changeFromText = function(){
	var pg = require('pg');
	var q = "UPDATE clients_and_their_info SET texted = false where texted = true and delete_when_texted=false";
	var client = new pg.Client(process.env.DATABASE_URL);
	client.connect();
	var query = client.query(q);
	query.on('row', function(row){
		console.log(row)
	})
	query.on('end', function(){
		client.end();
	})
};
changeFromText();
//changeFromTexted
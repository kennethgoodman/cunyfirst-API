//RESTART HEROKU
restartHeroku = function(){
	var Heroku = require('heroku.node');

	var client = new Heroku({email: 'kennethsgoodman@yahoo.com', api_key: process.env.HEROKU_API_TOKEN});

	client.app(process.env.HEROKU_APP_NAME).dynos.list(function(err,dyno){
		client.app(process.env.HEROKU_APP_NAME).dyno(dyno[0].id).restart(function(e,f){
		
		})
	})
}
restartHeroku();
//DONE

//DELTE THOSE WE TEXTED ALREADY
deleteTexted = function(){
	var pg = require('pg');
	var q = 'DELETE FROM clients_and_their_info where texted = true';
	var client = new pg.Client(process.env.DATABASE_URL);
	client.connect();
	var query = client.query(q);
	query.on('row', function(row){
		console.log(row)
	})
	query.on('end', function(){
		client.end();
	})
}
deleteTexted();
//DONE
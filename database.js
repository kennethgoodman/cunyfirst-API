try{
    var dotenv = require('dotenv')
    dotenv.load();
}catch(err){
    //do nothing if this fails, we are in dev
}
var pg = require('pg');
pg.defaults.poolIdleTimeout = 2000;
queryDatabasePerRow = function(query,callback){
	if(query == undefined || query == null){
		callback({error:"bad query"})
		return;
	}
	pg.connect(process.env.DATABASE_URL, function(err, client) {
	  if (err) console.log("err");
	  
	  client
	    .query(query)	//'SELECT * FROM clients_and_their_info')
	    .on('row', function(row) {
	      callback(row)
	      done();
	      return JSON.stringify(row)
	    });
	});
}
sendQuery = function(query, params, callback){
	if(query == undefined || query == null){
		callback({error:"bad query"})
		return;
	}
	//console.log(query)
	pg.connect(process.env.DATABASE_URL, function(err, client) {
		  if (err) {
		  	console.log(err);
		  	pg.end();
		  	return;
		  }
		  //console.log('Connected to postgres! Getting schemas...');
		  client
		    .query(query, params, function(err, result) {
			    if(err) {
			      err["Error"] = true;
			      console.error('error running query', err);
			      callback(err)
			      client.end();
			    }
			    else{
			    	callback(result);
			    	client.end();
			    }
			})
		})
}
sendQuery2 = function(q,params, callback){
	if(q == undefined || q == null){
		callback({error:"bad query"})
		return;
	}
	var client = new pg.Client(process.env.DATABASE_URL);
	client.connect();
	var query = client.query(q,params);
	query.on('row', function(row){
		callback(row)
	})
	query.on('end', function(){
		client.end();
	})
}
var counter = 0;
viewTable = function(callback){
	sendQuery('SELECT * FROM clients_and_their_info','', callback)
}
//viewTable(function(result){console.log(result)})
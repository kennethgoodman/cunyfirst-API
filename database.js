var express = require('express');
var app = express();
var pg = require('pg');
var dotenv = require('dotenv')
dotenv.load();
pg.defaults.poolIdleTimeout = 2000;
queryDatabasePerRow = function(query,callback){
	pg.connect(process.env.DATABASE_URL, function(err, client) {
	  if (err) console.log("err");
	  //console.log('Connected to postgres! Getting schemas...');
	  client
	    .query(query)	//'SELECT * FROM clients_and_their_info')
	    .on('row', function(row) {
	    	//console.log(row)
	      //console.log(JSON.stringify(row));
	      callback(row)
	      done();
	      return JSON.stringify(row)
	    });
	});
}
sendQuery = function(query, params, callback){
	//console.log(query)
	pg.connect(process.env.DATABASE_URL, function(err, client) {
		  if (err) {
		  	console.log(err);
		  	console.log(query);
		  	pg.end();
		  	return;
		  }
		  console.log('Connected to postgres! Getting schemas...');
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
			    	//console.log("sending")
			    }
			})
		})
}
sendQuery2 = function(q,params, callback){
	//console.log(q);
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
viewTable = function(callback){
	sendQuery('SELECT * FROM clients_and_their_info', callback)
}
//viewTable(function(result){console.log(result)})
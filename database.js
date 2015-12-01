/*var dotenv = require('dotenv')
dotenv.load();*/
var pg = require('pg');
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
		  	//console.log(query);
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
sendQuery2("SELECT * from users where user_id ='ken';;; SELECT * from clients_and_their_info where dept = 'ARAB';", [], function(result){
	//console.log(result)
}); 
var counter = 0;
var queue = [];
var queueParams = [];
var queueAdd = function(query, params){
	queue.push(query);
	queueParams.push(params);
}
/*var k = setInterval( function(){
	sendQuery2(queue[i],queueParams[i], function(result){
		//console.log(result);
		console.log(count++)
		setTimeout(function(){
			console.log("in setTimeout: "+ count);
		},1000*i)
		i += 1;
		if(i >= 21){
			i = 0;
			//clearInterval(k);
		}
	})
},10)
//}
var queueRead2 = function lambda(callback){
	var i = 0;
	var interval = setInterval(function(){
		sendQuery(qu)
	})
}*/
var queueRead = function lambda(){
	//console.log(queue.length)
	//var query = queue.join(";");
	var queue2 = queue;
	var queueParams2 = queueParams;
	queue = [];
	queueParams=[];
	var client = new pg.Client(process.env.DATABASE_URL);
	client.connect();
	client.query('begin');
	for(var i = 0, len = queue2.length;i<len; i++){
		if(i == len-1){
			client.query(queue2[i], queueParams2[i], function(err, result){
				if(err) {
				    //if there was an error postgres has already & automatically rolled back changes from the INSERT command
				    //so execute any application error handling here
				  }
				  else {
				  	console.log(result)
				    client.query('COMMIT');  //I guess 'END' works as well, but COMMIT is what's documented by Postgres
				  	client.end();
				  }
			})
		} else{
			client.query(queue2[i], queueParams2[i]);
		}
	}
	/*
	var query = queue2.join("");
	var queryParams = queueParams2.join();
	var counter = 1;
	var newQuery = "";
	for(var i = 0, len = query.length; i < len; i++){
		if(query[i-1] == "$"){
			newQuery = newQuery.concat(String(counter));
			counter++;
		} else{
			newQuery = newQuery.concat(query[i])
		}
	}
	var newParams = "";
	queryParams= queryParams.split(",")
	sendQuery2(newQuery, queryParams, function(result){
		console.log(result.user_id)
	})
	/*for(var i = 0; i < queue2.length; i++){
		sendQuery2(queue2[i],queueParams2[i], function(result){
			console.log(result);
		})
	}*/
	//*/
}
//queueRead();
/*sendQuery("SELECT * from clients_and_their_info where dept =$1;", ['ARAB'],function(result){
	console.log(result)
})*/
/*setInterval(function(){ 
	if(queue.length && counter < 1){ 
		counter++;
		queueRead() 
	}
}, 1000);*/
viewTable = function(callback){
	sendQuery('SELECT * FROM clients_and_their_info', callback)
}
//viewTable(function(result){console.log(result)})
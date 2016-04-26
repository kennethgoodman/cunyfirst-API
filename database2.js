var worker = require('./worker');
require('./ClassLooper')
var pg = require('pg');
var database_URL = "postgres://postgres@localhost/cuny_first_db";
pg.defaults.poolIdleTimeout = 2000;

allClasses(function(inst, sessions){
	pg.connect(database_URL, function(err, client, done) {
		if(err) {
			err["Error"] = true;
			console.error('error running query', err);
			client.end();
		}
    client.query("DELETE FROM classes")
		for (var i=0; i<inst.length; i++){
			var params =[inst[i].id, inst[i].name]
      		client.query("INSERT INTO schools VALUES ($2, $1)", params, function(err, result) {
        	})
     	 }
     	 for (var m= 0; m<sessions.length; m++){
     	 	var current = sessions[m]
     	 	var params = [current.inst, current.session, current.name]
     	 	//console.log(params)
     	 	client.query("INSERT INTO session VALUES ($3, $2, $1)", params, function(err, result){
     	 		if (err){
     	 			console.log("something wrong")
     	 			console.log(result)
     	 			console.log(err)
     	 		}
     	 	})
     	 }
     	 done();  // client idles for 30 seconds before closing
         console.log("we're up to beer")
	})

    sendQuery = function(query, params, callback){
    if(query == undefined || query == null){
        callback({error:"bad query"})
        return;
    }
    //console.log(query)
    pg.connect(database_URL, function(err, client) {
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

})

var db = require('./database');
var bot = require('./bot')
a = function(data){
	getClasses(data['inst'], data['session'], data['dept'], 'E', String(data['class']), String(data['section']),
        function(status,text){
        	//console.log(status)
        	console.log(text)
            if(status != "Closed" && !data['texted']){
                var nbr = data['phone_number']
                var query = "UPDATE clients_and_their_info SET texted = TRUE Where dept = \'"+data['dept'] + "\' AND class = \'" + data['class'] + "\' AND section = \'" +data['section'] +"\';";
                sendQuery(query, function(result){ //change texted to TRUE in DB
                	console.log(result);
                })
                send_message(nbr,text) //send text to user
            }
        });
}

intervalFn = function(result){
	var k =0;
	var interval = setInterval( function(){
		if(k == result.rowCount) k=0;
		if(!result.rows[k%result.rowCount].texted) a(result.rows[k%result.rowCount]) //if not texted
		k += 1
	}, 5000)
}
checkopen = function(){
	try{
		var q = 'SELECT * FROM clients_and_their_info'// where section = 58212';
		sendQuery(q,function(result){
						//intervalFn(result)
						for(var k = 0; k < result.rowCount; k++){
							if(!result.rows[k%result.rowCount].texted) a(result.rows[k%result.rowCount]) //if not texted
						}//run each query every 5 seconds, I assume CF is checking to make sure one IP doesnt overload server
			    	})
	} catch(err){
		console.log(err)
	}
}
var CronJob = require('cron').CronJob;
var checkOpen = new CronJob({
	cronTime: "7 * * * * *",
	onTick: checkopen,
	start: true,
	timeZone: 'America/Los_Angeles'
})
//var data = queryDatabase(q,a);

/*
var pg = require('pg');
pg.connect(process.env.DATABASE_URL, function(err, client) {
	  if (err) console.log("err");
	  console.log('Connected to postgres! Getting schemas...');
	  client
	    .query(q, function(err, result) {
	    	//done();
		    if(err) {
		      console.error('error running query', err);
		    }
		    else{
		    	function(){
		    		var k = 0
			    	setInterval( function(){
			    		if(k == 3) return
			    		a(result.rows[k])
			    		k += 1
			    	}, 1500)
		    	}
		    	 //1500 for safekeeping as 900 fails
		    }
		    //output: 1
		  });
	});*/

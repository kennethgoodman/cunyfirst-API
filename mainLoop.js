
/*var dotenv = require('dotenv')
dotenv.load(); */
var db = require('./database');
//var bot = require('./bot')
var worker = require('./worker')
/*var textedInSession;

a = function(data,callback){
	getClasses(data['inst'], data['session'], data['dept'], 'E', String(data['class']), String(data['section']),
        function(status,text){
        	if(status == "err"){
        		callback()
        		return;
        	}
        	//console.log(status)
        	console.log(text)
            if(status != "Closed" && !data['texted']){
                var nbr = data['phone_number']
                var query = "UPDATE clients_and_their_info SET texted = TRUE Where dept = \'"+data['dept'] + "\' AND class = \'" + data['class'] + "\' AND section = \'" +data['section'] +"\';";
                sendQuery(query, function(result){ //change texted to TRUE in DB
                	console.log(result);
                })
                send_email(nbr, data['provider'], text);
                
                //send_message(nbr,text) //send text to user
                //textedInSession[k] = 1;
            }
            callback();
        });
}
var queue = []
readQue = function lambda(){
	var item = queue.shift();
	//console.log(item);
	if(item != undefined){ 
		try{
			a(item,function(){
				lambda()
			});
		} catch(err){
			lambda();
		}
	}
	else{
		setTimeout(function(){ lambda()}, 5000)
	}
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
						textedInSession = Array.apply(null, Array(result.rowCount)).map(function (x, i) { return 0; })
						//so that user only gets texted once
						var k =0;
						var interval = setInterval( function(){
							if(k == result.rowCount) k=0;
							if(!result.rows[k%result.rowCount].texted && textedInSession[k] == 0) a(result.rows[k%result.rowCount],k) //if not texted
							k += 1
						}, 5000)//run each query every 5 seconds, I assume CF is checking to make sure one IP doesnt overload server
			    	})
	} catch(err){
		console.log(err)
	}
}
//var q = 'SELECT * FROM clients_and_their_info';
/*setInterval( function(){
		sendQuery2(q, function(row){
			if(!row.texted) queue.push(row)
		})
	}, 5000);*/
//setTimeout(function(){readQue();},15000);
var queue = []   //queue for the classes, pop one off when we look at it
var counter = 0; //count how many threads in the function, only want one at the max
queueRead2 = function lambda(){
	var item = queue.shift();
	if(item != undefined){ 
		try{
			getSections(item.inst, item.session, item.dept, function(struct){
				var q = "SELECT DISTINCT class, section FROM clients_and_their_info where inst = \'" + item.inst + "\' and session=\'" + item.session + "\' and dept=\'" + item.dept + "\' order by class, section;";  
				sendQuery2(q, function(row){
					try{
						var text = item.dept + ": "+ row["class"] +', ' + row["section"] + ' is ' + struct[row["class"]][row["section"]]["Status"] + ". Teacher: " + struct[row["class"]][row["section"]]['Instructor'];
						console.log(new Date() + ": " + text)
					} catch(err){
						console.log(err)
					}
					if(struct.hasOwnProperty(row["class"]) && struct[row["class"]].hasOwnProperty(row["section"]) && struct[row["class"]][row["section"]]["Status"] != "Closed"){
						var q = "SELECT phone_number, provider,texted from clients_and_their_info where inst = \'" + item.inst + "\' and session=\'" + item.session + "\' and dept=\'" + item.dept + "\' and class=\'" + row["class"] + "\' and section=\'" +row["section"] +"\' and texted=false";
						sendQuery2(q, function(data){
							if(!data['texted']){
								send_email(data['phone_number'], data['provider'], text);
								var query = "UPDATE clients_and_their_info SET texted = TRUE Where dept = \'"+item.dept + "\' AND class = \'" + row["class"] + "\' AND section = \'" +row["section"] +"\';";
				                sendQuery(query, function(result){ //change texted to TRUE in DB
				                	console.log(result);
				                })
				            }
						})
						
					}
					if(queue.length && counter < 1){
						//counter++;
						//lambda();
					} 
				})
			})
		} catch(err){
			console.log(err)
			//lambda()
		}
	}
	else{
		//lambda()
	}
	counter--;	
}
var q = 'SELECT DISTINCT inst, dept, session FROM clients_and_their_info order by inst, session, dept'
var queryCount = 'Select count(*) from clients_and_their_info'
var amount_of_rows = 1000000;
setInterval( function(){
	sendQuery2(queryCount, function(result){
		amount_of_rows = result["count"];
	})
}, 1000*60*60) //every hour;
setInterval( function(){
	if(queue.length > parseInt(amount_of_rows*1.5)){
		queue = [];
	}
	sendQuery2(q, function(row){
		if(queue.length < parseInt(amount_of_rows*1.5)) queue.push(row)
	})

},10000)
setInterval(function(){ 
	if(queue.length && counter < 1){ 
		counter++;
		queueRead2() 
	}
}, 7500);

//var r = sendQuery('SELECT * FROM clients_and_their_info', function(){})
//setTimeout( function(){ console.log(r)},5000)
//checkopen();
/*var CronJob = require('cron').CronJob;
var checkOpen = new CronJob({
	cronTime: "* * 6 * * *",
	onTick: checkopen,
	start: true,
	timeZone: 'America/Los_Angeles'
})
var checkOpen = new CronJob({
	cronTime: "* * 12 * * *",
	onTick: checkopen,
	start: true,
	timeZone: 'America/Los_Angeles'
})
var checkOpen = new CronJob({
	cronTime: "* * 18 * * *",
	onTick: checkopen,
	start: true,
	timeZone: 'America/Los_Angeles'
})
var checkOpen = new CronJob({
	cronTime: "* * 0 * * *",
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

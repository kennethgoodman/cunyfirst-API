try{
    var dotenv = require('dotenv')
    dotenv.load();
}catch(err){
    //do nothing if this fails, we are in dev
}

var db = require('./database');
var worker = require('./worker');
var texts = require('./texting');

var queue = []   //queue for the classes, pop one off when we look at it
var counter = 0; //count how many threads in the function, only want one at the max
queueRead2 = function lambda(){
	var item = queue.shift();
	if(item != undefined){ 
		try{
			getSections(item.inst, item.session, item.dept, function(struct){
				var q = "SELECT DISTINCT class, section FROM clients_and_their_info where texted = false and inst = $1 and session=$2 and dept= $3 order by class, section;";  
				var params = [item.inst,item.session,item.dept]
				sendQuery2(q, params, function(row){
					if(row == undefined || row == null) {
						console.log("returning")
						return;
					}
					if(row.error){
						if(Math.random() > .95)
							console.log(row.error)
						return
					}
					try{
						var text = item.dept + ": "+ row["class"] +', ' + row["section"] + ' is ' + struct[row["class"]][row["section"]]["Status"] + ". Teacher: " + struct[row["class"]][row["section"]]['Instructor'];
						console.log(new Date() + ": " + text)
					} catch(err){
						console.log(err)
					}
					if(struct.hasOwnProperty(row["class"]) && struct[row["class"]].hasOwnProperty(row["section"]) && struct[row["class"]][row["section"]]["Status"] == "Open"){
						var q = 'select user_id, phone_number, provider, sendwith, texted from clients_and_their_info where inst=$1 and session=$2 and dept=$3 and class=$4 and section=$5 and texted=false';
						var params = [item.inst,item.session,item.dept,row["class"],row["section"]]
						sendQuery2(q, params, function(data){
							if(!data['texted']){
								send_alert2(data, text)
								var query = "UPDATE clients_and_their_info SET texted = TRUE Where dept = $1 AND class = $2 AND section = $3 AND user_id=$4";  
				                var params = [item.dept, row["class"],row["section"], data["user_id"]]

				                sendQuery(query, params, function(result){ //change texted to TRUE in DB
				                	try{
				                		console.log(result.command + " " + data["user_id"] + " "  + item.dept + " " + row["class"] + " " +row["section"]);
				                	} catch(err){
				                		console.log(result);
				                	}
				                })
				            }
						})		
					}
				})
			})
		} catch(err){
			console.log(err)
		}
	}
	counter--;	
}

var queryCount = 'Select count(*) from clients_and_their_info;'
var amount_of_rows = 1000000; 
setInterval( function(){
	sendQuery(queryCount,[], function(result){
		amount_of_rows = result.rows[0].count;
	})
}, 1000*60*10) //every 10 min, TEST IF THIS IS OK!

var q = 'SELECT DISTINCT inst, dept, session FROM clients_and_their_info where texted = false order by inst, session, dept;'
setInterval( function(){
	if(queue.length > parseInt(amount_of_rows*1.2)){ //still testing good number
		queue = [];
	}
	sendQuery2(q, [], function(row){
		if(queue.length < parseInt(amount_of_rows*1.5)) queue.push(row) //still testing good number
		//TODO put in a test to check if row returned an error
	})
},15000)
setInterval(function(){ 
	if(queue.length && counter < 1){ 
		counter++;
		queueRead2() 
	}
}, 10000);

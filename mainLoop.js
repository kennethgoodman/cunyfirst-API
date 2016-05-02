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
		console.log(item)
		try{
			getSections(item.inst, item.session, item.dept, function(struct){
				var q = "SELECT DISTINCT classnbr, section FROM customer_info where alerted = false and inst = $1 and session=$2 and dept= $3 order by classnbr, section;";  
				var params = [item.inst,item.session,item.dept]
				sendQuery2(q, params, function(row){
					if(row == undefined || row == null) {
						console.log("returning")
						return;
					}
					if(row.error){
						if(Math.random() > .95) //cuny first may be down, so lets do this infrequently
							console.log(row.error)
						return
					}
					try{
						var text = item.dept + ": "+ row["classnbr"] +', ' + row["section"] + ' is ' + struct[row["classnbr"]][row["section"]]["Status"] + ". Teacher: " + struct[row["classnbr"]][row["section"]]['Instructor'];
						//console.log(new Date() + ": " + text)
					} catch(err){
						console.log("Error when trying to create text")
						console.log("row[\"classnbr\"] = " + row["classnbr"])
						console.log("row[\"section\"] = " + row["section"])
						console.log("struct[row[\"classnbr\"]] = " + struct[row["classnbr"]])
						console.log(err)
					}
					if(struct.hasOwnProperty(row["classnbr"]) && struct[row["classnbr"]].hasOwnProperty(row["section"]) && struct[row["classnbr"]][row["section"]]["Status"] == "Open"){
						var q = 'select phone_number, provider, email, sendwith, alerted from customer_info where inst=$1 and session=$2 and dept=$3 and classnbr=$4 and section=$5 and alerted=false';
						var params = [item.inst,item.session,item.dept,row["classnbr"],row["section"]]
						sendQuery2(q, params, function(data){
							if(!data['alerted']){
								send_alert2(data, text)
								var query = "UPDATE customer_info SET alerted = TRUE Where dept = $1 AND classnbr = $2 AND section = $3 AND phone_number=$4 AND email=$5";  
				                var params = [item.dept, row["classnbr"],row["section"], data["phone_number"], data["email"]]

				                sendQuery(query, params, function(result){ //change alerted to TRUE in DB
				                	try{
				                		console.log(result.command + + " "  + item.dept + " " + row["classnbr"] + " " +row["section"]);
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

var queryCount = 'Select count(*) from customer_info;'
var amount_of_rows = 1000000; 
setInterval( function(){
	sendQuery(queryCount,[], function(result){
		amount_of_rows = result.rows[0].count;
	})
}, 1000*60*10) //every 10 min, TEST IF THIS IS OK!

var q = 'SELECT DISTINCT inst, dept, session FROM customer_info where alerted = false order by inst, session, dept;'
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
}, 15000);

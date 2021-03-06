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
global.CUNYFIRST_DOWN = false

updateStatus = function (item,row,data) {
    var query = "UPDATE customer_info SET alerted = TRUE Where dept = $1 AND classnbr = $2 AND section = $3 AND phone_number=$4 AND email=$5";
    var params = [item.dept, row["classnbr"],row["section"], data["phone_number"], data["email"]]

    sendQuery(query, params, function(result){ //change alerted to TRUE in DB
        try{
            logger.log(result.command + + " "  + item.dept + " " + row["classnbr"] + " " +row["section"]);
        } catch(err){
            logger.warn("Error was thrown: \nresult: %s\nerror: %j", result, err);
        }
    })
}

getText = function (item,row,struct) {
    try{
        var text = item.dept + ": "+ row["classnbr"] +', ' + row["section"] + ' is ' + struct[row["classnbr"]][row["section"]]["Status"] + ". Teacher: " + struct[row["classnbr"]][row["section"]]['Instructor'];
    } catch(err){
        logger.log("Error when trying to create text")
        logger.log("row[\"classnbr\"] = " + row["classnbr"])
        logger.log("row[\"section\"] = " + row["section"])
        logger.log("struct[row[\"classnbr\"]] = " + struct[row["classnbr"]])
        logger.error(err)
        text = 'One of your classes is open, error parsing'
    }
    return text
}

logCFDown = function () {
    if(global.LOG_CF_DOWN == false){
        logger.log("CF is down")
        global.LOG_CF_DOWN = true
    }
    global.CUNYFIRST_DOWN = true
}

look_at_struct_at_notify_users_of_open = function(item,struct){
    if(struct === "CUNYFIRST may be down"){
        logCFDown()
        return
    }
    var q = "SELECT DISTINCT classnbr, section FROM customer_info where alerted = false and inst = $1 and session=$2 and dept= $3 order by classnbr, section;";
    var params = [item.inst,item.session,item.dept]
    sendQuery2(q, params, function(row){
        if(row == undefined || row == null) {
            logger.warn("row was null or undefined")
            return;
        }
        if(row.error){
            if(Math.random() > .95) //cuny first may be down, so lets do this infrequently
                logger.error(row.error)
            return
        }
        if(struct.hasOwnProperty(row["classnbr"]) && struct[row["classnbr"]].hasOwnProperty(row["section"]) && struct[row["classnbr"]][row["section"]]["Status"] == "Open"){
            var text = getText(item,row,struct)
            var q = 'select phone_number, provider, email, sendwith, alerted from customer_info where inst=$1 and session=$2 and dept=$3 and classnbr=$4 and section=$5 and alerted=false';
            var params = [item.inst,item.session,item.dept,row["classnbr"],row["section"]]
            sendQuery2(q, params, function(data){
                if(!data['alerted']){
                    send_alert2(data, text)
                    updateStatus(item,row,data)
                }
            })
        }
    })
};

queueRead2 = function lambda(){
	var triplet = queue.shift();
	if(triplet != undefined){
		try{
            getSections2(triplet,look_at_struct_at_notify_users_of_open)
		} catch(err){
			logger.warn("Error was thrown:\nerror: %j", err);
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
	if(queue.length == 0){
		sendQuery2(q, [], function(row){
			queue.push(row)
		
		})//TODO put in a test to check if row returned an error
	}
},15000)
setInterval( function(){ global.CUNYFIRST_DOWN = false }, 1000*60) //every minute change back, so we check if its still down 
setInterval( function(){ global.LOG_CF_DOWN = false }, 1000*60*60) //every hour change back, so we still log
setInterval(function(){ 
	if(queue.length && counter < 1 && !global.CUNYFIRST_DOWN){ //if cunyfirst is not down 
		counter++;
		queueRead2() 
	}
}, 17500);

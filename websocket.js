var logger = require('tracer').console({
                  format : [ "<{{title}}> {{file}}:{{line}}: {{message}}", 
                  		{
                  			error: "<{{title}}> {{file}}:{{line}}: {{message}} \nCall Stack: {{stack}}",
                  			debug: "{{timestamp}} <{{title}}> {{file}}:{{line}}: {{message}}",
                  			dateformat : " h:MM:ss TT"
                  		}],
                  preprocess: function(data){ data.title = data.title.toUpperCase()}
              })
module.exports = function(wss){
	wss.on("connection", function(ws){
		var id = setInterval(function(){
			ws.send(JSON.stringify(["keep open", new Date()]),function(){})
		},500) // constantly ping the client side every .5 seconds, is this bad?
		logger.info("websocket connection open")
		ws.on("close", function(){
			logger.info("websocket connection closing")
		})
		ws.on('message', function(data){
			logger.log("message received : " + data)
			data = JSON.parse(data)
			commandRecieved = data[0];
			switch(commandRecieved){
				case "test":
					var a = ["test"]
					var b = []
					for(i=0; i < 50000; i++){
						b.push([i, i+1, i+2, i+3, i+4, i+5])
					}
					a.push(b)
					sendData(ws, a)
					break
				case "get_inst":
					var a = ["inst"]
					getInstitutionsGlobal( function(data){
						a.push(data)
						sendData(ws,a)
					})
					break;
				case "get_session":
					var count = 0;				
					checkForEmptyData(data, ws, function(data){
						var a = ["session"]
						var institution = data[1]
						getSession(institution, function(inst,data){
							var keys = Object.keys(data)
							for(var sess in keys){
								if(sess != undefined){
									var temp = {}
									temp[keys[sess]] = data[keys[sess]]
									a.push(temp)
								}
							}
							// Need to rewrite the rest of this functions, something strange here
							if(a.length == 0 && count++ < 3){
								getSession(institution,callback(data))
							} else if(count >= 3){
								sendData(ws, ["err", "An error occured, please refresh the page or contact support."])
							} else{
								sendData(ws,a)
							}
						})
					})
					break;
				case "get_dept":
					checkForEmptyData(data, ws, function(data){
						var a = ["dept"]
						var institution = data[1]
						var session = data[2]
						getDept(institution,session,function(data){
							a.push(data)
							sendData(ws,a)
						})
					})
					break
				case "get_classes":
					var a = ["classes"]
					getClassesGlobal([data[1],data[2]],function(data){
						a.push(data)
						sendData(ws,a)
					})
					break
				case "getTestClasses":
					checkForEmptyData(data, ws, function(data){
						var a = ["classes"]
						var temp = {}
						var template = {
										'subject_name'	: 'Mathematics',
										'subject_code'	: 'MATH',
										'class_id'	  	: '',
										'class_num'   	: '',
										'teacher'     	: 'Teacher',
										'days_and_times': '',
										'room'			: 'Kiely 231',
									}
						var counter = 1			
						var tempTemplate = JSON.parse(JSON.stringify(template)) // copy it
						tempTemplate['class_id'] = '10' + counter, tempTemplate['days_and_times'] = 'MoTu 10:45AM - 12:00PM', tempTemplate['class_num'] = counter++
						temp[tempTemplate['class_id']] = tempTemplate
						
						tempTemplate = JSON.parse(JSON.stringify(template)) // copy it
						tempTemplate['class_id'] = '10' + counter, tempTemplate['days_and_times'] = 'MoTu 12:10PM - 1:25PM', tempTemplate['class_num'] = counter++
						temp[tempTemplate['class_id']] = tempTemplate
						
						tempTemplate = JSON.parse(JSON.stringify(template)) // copy it
						tempTemplate['class_id'] = '10' + counter, tempTemplate['days_and_times'] = 'TBA', tempTemplate['class_num'] = counter++
						temp[tempTemplate['class_id']] = tempTemplate
						
						a.push(temp)
						sendData(ws, a)
					})
				case "removeUserClass":
					var query = "REMOVE FROM customer_info WHERE inst = $1 AND session = $2 AND dept = $3 and classnbr = $4 AND section = $5";
					logger.log(query)
					logger.log(data.slice(2, data.length - 1))
					//sendQuery(query, data.slice(1, data.length - 1))
					break
				case "get_class":
					checkForEmptyData(data, ws, function(data){
						var a = ["class_nbr"]
						var institution = data[1]
						var session = data[2]
						var dept = data[3]
						getSections(institution,session,dept, function(data){
							a.push(data)
							sendData(ws,a)
						})
					})
					break
				case "getCarriers":
					checkForEmptyData(data, ws,function(data){
	    				var a = ["carriers"];
	    				a.push(returnCarriersNames());
	    				sendData(ws,a); 
	    			})
					break;
				case "getClassesForUser": 
				    var q = "SELECT inst, session, dept, classnbr, section from customer_info where phone_number=$1 and provider=$2 and alerted = false"
	              	sendQuery(q,[data[1],data[2]],function(result){
	                	var temp = ["classesForUser"];
	                	result = result.rows
	                	for(var row in result){
	                		var session = result[row]["session"]
	                  		if(session == "1162") {
	                    		result[row]["session"] = result[row]["session"] + " - Spring 2016";
	                  		}
	                  		else if(session == "1169") {
	                    		result[row]["session"] = result[row]["session"] + " - Fall 2016";
	                  		}
	                  		else if(session == "1166"){
	                  			result[row]["session"] = result[row]["session"] + " - Summer 2016";
	                  		}
	                  		temp.push(result[row])
	                	}
	                	sendData(ws, temp)
	                })
					break
		        case "getRMP":
		        	checkForEmptyData(data,ws,function(data){		
		        		var institution = data[1]
						var teacher = data[2]
						var index = data[3]
						var tableId = data[4]
						var b = ["teacherInfo"]
						getTeacherInfo([institution,teacher], function(data){
							b.push(data[0])
							b.push(index)
							b.push(tableId)
							b.push(teacher)
							sendData(ws,b)
						})
					})
		        	break
		        case "updateStatus":
		        	var b = ["statusInfo"]
		        	var institution = data[1]
					var session = data[2]
					var dept = data[3]
					b.push(institution)
					b.push(session)
			        b.push(dept)
			        if(global.CUNYFIRST_DOWN == true){
			        	b.push("CUNYFIRST may be down")
			        	sendData(ws,b)
			        	return
			        }
			        getSections(institution,session,dept,function(result){
			        	if(result === "CUNYFIRST may be down"){
			        		logger.log("CF is down")
			        		global.CUNYFIRST_DOWN = true
			        		b.push("CUNYFIRST may be down")
			        		sendData(ws,b)
			        		return // dont go forward since CF may be down
			        	}
		    			//console.log(result)
		    			try{
		    				var sstruct= {}
		    					for (i in result){
		    						for (j in result[i]){
		    							sstruct[j] = result[i][j]["Status"]
		    						}
		    					}
		    					b.push(sstruct)
		    					sendData(ws,b)
		    			}
		    			catch(err){
		    				logger.error("Error was thrown\nerror: %j" ,err)
		    			}
					})
					break
				case "submit": 
		        	checkForEmptyData(data, ws,function(data){
		        		var phone_num = data[data.length-4]
		                var carrier = data[data.length-3]
		                var email = data[data.length-2]
		                var sendWith = data[data.length -1]
		        		sendConfirmationText = function(phone_num, carrier, tempText){
		        			var q = "SELECT inst, session, dept, classnbr, section, alerted from customer_info where phone_number=$1 and provider=$2 and alerted = false"
	              			sendQuery(q, [phone_num,carrier],function(result){
	              				result = result.rows
	              				for(var row in result){
	              					row = result[row]
	              					var dept = row["dept"],classnbr = row["classnbr"], section = row["section"]
	              					if(dept == undefined && classnbr == undefined && section == undefined)
	              						continue
	              					else{
	              						if(dept == undefined)
	              							dept = "NA"
	              						if(classnbr == undefined)
	              							classnbr = "NA"
	              						if(section == undefined)
	              							section = "NA"
	              						tempText += row["dept"] +" - "+ row["classnbr"] +": "+ row["section"] +",\n"
	              					}
	              				}
	              				tempText = tempText.substring(0, tempText.lastIndexOf(","))
	              				sendData(ws,["sendNotification", tempText])
                        		send_confirmation(phone_num, carrier, tempText)
	              			})
                    		
                    	}
		                var sendFunction = function(data){
			                var texted = "false";
			                var query = "INSERT INTO customer_info VALUES (";
			                var params = [];
		                	for(var i = 1; i < data.length-4; i++){ //minus two becuase, last options are contactHow, email
			                    query += "$"+((i-1)*9 + 1)
			                    for(var j=2; j <= 9; j++){
			                    	query += ",$"+((i-1)*9 + j)
			                    }
			                    query += ",false)"
			                    if(i+1 == data.length-4) query += ";"
			                    else query += ", ("
			                    for(var k in data[i]){
			                    	if(typeof data[i][k] != typeof function(){})
			                    		params.push(data[i][k])
		                    	}

		                		params.push(phone_num); //phone nbr
		                		params.push(carrier); //carrier
		                		params.push(data[data.length-2]); //email
		                		params.push(data[data.length-1]); //sendWith
		                  	}
		                  
		                  	logger.log("inserting into table");
		                 	sendQuery(query, params, function(result){
			                    if(result.hasOwnProperty("Error")){
			                      //TODO: test to find all possible errors
			                    	if(result.code == '23505'){
			                        	sendData(ws, ["err", "You\'ve signed up for one of these classes already, if this is a mistake, please contact support"])
			                        	logger.warn("PK problem error on query");
			                        	return;
			                      	}
			                      	else{
			                        	sendData(ws, ["err","An error occured, please contact support"])
			                        	logger.error("Unknown error on query");
				                        return;
				                    }
			                    }
			                    else{
			                    	sendConfirmationText(phone_num, carrier,"Classes you are currently signed up for: \n")
			                    }
		                	})
						};
						var q = "SELECT inst, session, dept, classnbr, section, alerted from customer_info where phone_number=$1 and provider=$2;"
	              		sendQuery(q,[phone_num,carrier],function(result){
	              			var updateQuery = "UPDATE customer_info SET alerted = false where inst = $1 and session = $2 and dept = $3 and classnbr = $4 and section = $5 and alerted = true and phone_number = $6 and provider = $7;"
	              			newData = []
	              			newData.push(data[0])
	              			result = result.rows
	              			for(var i = 1; i < data.length-4; i++){ // if the row is in the DB already
	              				var inst = data[i][0]
	              				var session = data[i][4]
	              				var dept = data[i][1]
	              				var classnbr =  data[i][2]
	              				var section = data[i][3]
	              				var found = false
	              				for(var row in result){
	              					row = result[row]
		              				if(row["inst"] == inst && row["session"] == session && row["dept"] == dept &&  row["classnbr"] == classnbr && row["section"] == section){
		              					if(row["alerted"] == true){ //if we have texted them, change texted to true
		              						sendQuery(updateQuery, [inst, session, dept, classnbr, section, phone_num, carrier], function(){

		              						})
		              					}
		              					found = true	
		              				}
		       						
	              				}
	              				if(found == false){
	              					//if it isn't there, then we want to add it 
	              					newData.push(data[i])
	              				}
	              			}
	              			newData.push(phone_num)
	              			newData.push(carrier)
	              			newData.push(email)
	              			newData.push(sendWith)
	              			if(newData.length == 5){
		                  		sendConfirmationText(phone_num, carrier, "Classes you are currently signed up for: \n")
		                  	}
		                  	else{
		                  		sendFunction(newData);
		                  	}
	              		})
					})
					break;
			}
		})
	})
	function sendData(socket,data){
	    if(socket == undefined){
	      return;
	    }
	  	if (socket.readyState != socket.OPEN) { //check if socket is open before sending
	      	console.error('Client state is ' + socket.readyState);
	      //or any message you want
	  	} else {
	  	    socket.send(JSON.stringify(data)); //send data to client
	  	}
	}
	function checkForEmptyData(data,socket,callback){
		for(var d in data){
	      	if(data[d] === ""){
		        sendData(socket,["err", "One of your fields is empty, if this is a mistake, please contact support."])
		        logger.warn("Error: empty field");
		        return false;
	      	}
		    try{
		        for(var e in data[d]){
		      		if(data[d][e] === ""){
		            	sendData(socket, ["err", "One of your fields is empty, if this is a mistake, please contact support"])
		            	logger.warn("Error: empty field");
		            	return false;
		          	}
		        }
		    }	catch(err){

		    }
		}
	  	callback(data)
	}
}


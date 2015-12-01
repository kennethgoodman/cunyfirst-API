var sent = false; 
module.exports = function(wss){
  wss.on("connection", function(ws) {
    var id = setInterval(function() {
      ws.send(JSON.stringify(["keep open",new Date()]), function() {})
    }, 2500) //to keep connection open
    console.log("websocket connection open")
    ws.on("close", function() {
      console.log("websocket connection close")
      clearInterval(id)
      ws.close();
      return;
    })
    ws.on('message',function(data){
        /*
        dbErrorCheck = function(result, callback){
          if(result.hasOwnProperty("Error")){
            //TODO: test to find all possible errors
            if(result.code == '23505'){
              sendData(ws, ["err", "You\'ve signed up for one of these classes already, if this is a mistake, please contact support"])
              console.log("PK problem error on query");
            }
            else{
              sendData(ws, ["err","An error occured, please contact support"])
              console.log("Unknown error on query");
            }
          }
          else{
            if(callback){
              callback(result)
            }
          }
        }*/
    		console.log('message receieved : '+data); 
    		data = JSON.parse(data);
    		if(data[0] == "get_inst"){
    			var a = ["inst"];
    			getInst(function(data){
    				a.push(data);
    				sendData(ws,a)
      				//ws.send(JSON.stringify(a))
      			})
    		}
    		else if(data[0] == "get_session"){
          var count = 0;
    			checkForEmptyData(data, ws,function(data){
    				var a = ["session"];
    				getSession(data[1],function(inst,data){
  	  				var keys = Object.keys(data);
  	  				for(var sess in keys){
  	  					if(sess != undefined){
  	  						var temp = {};
  	  						temp[keys[sess]] = data[keys[sess]];
  	  						a.push(temp)
  	  					}
  	  				}
              if(a.length == 0 && count++ < 3){
                getSession(data[1], callback(data))
                return;
              } else if(count >= 3){
                sendData(ws,["err", "An error occured, please refresh the page or contact support."])
              }
    				//a.remove(a.length-1)
    					sendData(ws,a)
    				//ws.send(JSON.stringify(a))
    				})
    			})
    		}
    		else if(data[0] == "get_dept"){
    			checkForEmptyData(data, ws,function(data){
  	  			var a = ["dept"];
  	  			getDept(data[1],data[2],function(data){
  	  				a.push(data);
  	  				sendData(ws,a)
  	  				//ws.send(JSON.stringify(a))
  	  			})
    			})
    		}
    		else if(data[0] == "get_class"){
    			checkForEmptyData(data, ws,function(data){
  	  			var a = ["class_nbr"];
  	  			getSections(data[1],data[2],data[3], function(data){
  	  				a.push(data);
  	  				sendData(ws,a)
  	  				//ws.send(JSON.stringify(a));
  	  			})
    			})
    		}
    		else if(data[0] == "getCarriers"){
    			checkForEmptyData(data, ws,function(data){
    				var a = ["carriers"];
    				a.push(returnCarriersNames());
            //console.log(a)
    				sendData(ws,a);
    			})
    		}
        else if(data[0] == "getClassesForUser"){

        }
        else if(data[0] == "deleteClass"){
          checkForEmptyData(data, ws,function(data){
            if(data[1][1] == "Spring 2016") data[1][1] = "1162";
            var q = "DELETE FROM clients_and_their_info WHERE user_id=$1 and inst=$2 and session=$3 and dept=$4 and class=$5 and section=$6;"
            var params = [data[2], data[1][0],data[1][1],data[1][2],data[1][3],data[1][4]]
            sendQuery(q, params, function(result){
              if(result.hasOwnProperty("Error")){
                sendData(ws, ["err","An error occured, please contact support"])
                console.log("Unknown error on query");
              }
              else{
                //sendData(ws, ["Success", "Your classes have succesfully been entered"])
              }
            })
          })
        }
        else if(data[0] == "getCurrentClasses"){
          var q = "SELECT inst, session, dept, class, section,texted from clients_and_their_info where user_id=$1;"
          sendQuery2(q,[data[1]], function(row){
            if(row["session"] == "1162") {
                row["session"] = "Spring 2016";
              }
            sendData(ws, ["addClassToDT", row])
          })
          /*
          sendQuery(q,[data[1]],function(result){
            console.log(result)
            var temp = [];
            result = result.rows
            for(var row in result){
              if(result[row]["session"] == "1162") {
                result[row]["session"] = "Spring 2016";
              }
              temp.push(result[row])
            }
            sendData(ws,["classesBeingTaken",temp]);
          })*/
        }
        else if(data[0] == "changePhoneNumber"){
          checkForEmptyData(data, ws,function(data){
            var q = "UPDATE users set phone_number = $1 where user_id = $2";
            sendQuery(q, [data[2], data[1]], function(result){
              if(result.hasOwnProperty("Error")){
                    //TODO: test to find all possible errors
                if(result.code == '23505'){
                  sendData(ws, ["err", "You\'ve signed up for one of these classes already, if this is a mistake, please contact support"])
                  console.log("PK problem error on query");
                }
                else{
                  sendData(ws, ["err","An error occured, please contact support"])
                  console.log("Unknown error on query");
                }
              }
            })
          })
        }
    		else if(data[0] == "submit"){
    			checkForEmptyData(data, ws,function(data){
            var q = "SELECT count(*) from clients_and_their_info where user_id = $1;";
            //console.log(q)
            sendQuery(q, [data[1][7]], function(result){
              var number_of_classes = parseInt(result.rows[0].count)+data.length - 3;
              var classLimit = 7;
              if(number_of_classes > classLimit){ //check to see if user has too many classes filled out
                sendData(ws, ["err", "You\'ve signed up for " +  number_of_classes + " classes, the limit on this website for now is " + classLimit +". You can delete a class in the account tab."])
              }
              else{
                var sendFunction = function(data){
                  var texted = "false";
                  var query = "INSERT INTO clients_and_their_info VALUES (";
                  var params = [];
                  for(var i = 1; i < data.length-2; i++){ //minus two becuase, last options are contactHow, email
                    query += "$"+((i-1)*11 + 1)+",$"+((i-1)*11 + 2)+",$"+((i-1)*11 + 3)+",$"+((i-1)*11 + 4)+",$"+((i-1)*11 + 5)+",\'"+texted+"\',$"+((i-1)*11 + 6)+",$"+((i-1)*11 + 7)+",$"+((i-1)*11 + 8)+",$"+((i-1)*11 + 9)+",$"+((i-1)*11 + 10)+",$"+((i-1)*11 + 11)+")";
                    if(i+1 == data.length-2) query += ";"
                    else query += ", ("
                    for(var k in data[i]){
                      if(typeof data[i][k] != typeof function(){})
                        params.push(data[i][k])
                    }
                    params.push(data[data.length-1]);
                  }
                  //console.log(query)
                  console.log("inserting into table");
                  sendQuery(query, params, function(result){
                    if(result.hasOwnProperty("Error")){
                      //TODO: test to find all possible errors
                      if(result.code == '23505'){
                        sendData(ws, ["err", "You\'ve signed up for one of these classes already, if this is a mistake, please contact support"])
                        console.log("PK problem error on query");
                        return;
                      }
                      else{
                        sendData(ws, ["err","An error occured, please contact support"])
                        console.log("Unknown error on query");
                        return;
                      }
                    }
                    else{
                      var temp = [];
                      var q = "SELECT inst, session, dept, class, section,texted from clients_and_their_info where user_id=$1;"
                      //console.log(q)
                      sendQuery(q,[data[1][7]],function(result){
                        var temp = [];
                        result = result.rows
                        for(var row in result){
                          if(result[row]["session"] == "1162") {
                            result[row]["session"] = "Spring 2016";
                          }
                          temp.push(result[row])
                        }
                        sendData(ws,["classesBeingTaken",temp]);
                        if(data.length == 4){
                            sendData(ws,["sendNotification", "Your have succesfully added "+data[1][2] +": "+ data[1][3]])
                        }
                        else{
                          var temp = ""
                          for(var i = 1; i < data.length-2; i++){
                            temp += data[i][2] +": "+ data[i][3] + ", ";
                          }
                          temp[temp.length-1] = "";
                              sendData(ws,["sendNotification", "Your have succesfully added "+temp])
                        }
                        
                      });
                      //sendData(ws, ["Success", "Your classes have succesfully been entered"])
                      console.log("Success adding query");
                    }
                  })
                }
                var q = "SELECT * FROM users WHERE user_id = $1";
                //console.log(q)
                sendQuery(q, [data[1][7]], function(result){
                  var phnNbr = data[1][5];
                  var provider = data[1][8];
                  var email = data[data.length-2];
                  var sendWith = data[data.length-1];
                  var user_id = data[1][7];
                  if(result.rowCount == 0){
                    var q = "INSERT INTO users VALUES($1,$2,$3,$4,$5);";
                    sendQuery(q, [user_id,data[1][0],phnNbr,provider,email],function(result){
                      sendFunction(data);
                      //console.log(result);
                    })
                  } else{
                    var q = "UPDATE users SET phone_number = $1, provider = $2, email = $3 WHERE user_id = $4";
                    //console.log(result)
                    if(phnNbr == "N/A"){
                      phnNbr = result.rows[0]["phone_number"];
                    }
                    if(provider == "default"){
                      provider = result.rows[0]["provider"];
                    }
                    if(email == "N/A"){
                      email = result.rows[0]["email"];
                    }
                    console.log("inserting user");
                    sendQuery(q, [phnNbr,provider,email,user_id], function(result){
                      sendFunction(data);
                      //console.log(result)
                    })
                  }
                })
              }
            }) 
          })
    		}
    		//else: exit           
      });
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
        console.log("Error: empty field");
        return false;
      }
      try{
        for(var e in data[d]){
      		if(data[d][e] === ""){
            sendData(socket, ["err", "One of your fields is empty, if this is a mistake, please contact support"])
            console.log("Error: empty field");
            return false;
          }
        }
      } catch(err){

      }
  	}
  	callback(data)
  }
}
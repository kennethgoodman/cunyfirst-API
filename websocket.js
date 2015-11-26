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
    			checkForEmptyData(data, function(data){
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
                console.log("here")
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
    			checkForEmptyData(data, function(data){
  	  			var a = ["dept"];
  	  			getDept(data[1],data[2],function(data){
  	  				a.push(data);
  	  				sendData(ws,a)
  	  				//ws.send(JSON.stringify(a))
  	  			})
    			})
    		}
    		else if(data[0] == "get_class"){
    			checkForEmptyData(data, function(data){
  	  			var a = ["class_nbr"];
  	  			getSections(data[1],data[2],data[3], function(data){
  	  				a.push(data);
  	  				sendData(ws,a)
  	  				//ws.send(JSON.stringify(a));
  	  			})
    			})
    		}
    		else if(data[0] == "getCarriers"){
    			checkForEmptyData(data, function(data){
    				var a = ["carriers"];
    				a.push(returnCarriersNames());
    				sendData(ws,a);
    			})
    		}
        else if(data[0] == "getClassesForUser"){

        }
        else if(data[0] == "deleteClass"){
          checkForEmptyData(data, function(data){
            if(data[1][1] == "Spring 2016") data[1][1] = "1162";
            var q = "DELETE FROM clients_and_their_info WHERE user_id=$1 and inst=$2 and session=$3 and dept=$4 and class=$5 and section=$6;"
            var params = [data[2], data[1][0],data[1][1],data[1][2],data[1][3],data[1][4]]
            console.log(q);
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
          console.log(q);
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
    		else if(data[0] == "submit"){
    			checkForEmptyData(data, function(data){
            var q = "SELECT count(*) from clients_and_their_info where user_id = $1;";
            sendQuery2(q, [data[1][7]], function(result){
              var number_of_classes = parseInt(result.count)+data.length - 1;
              var classLimit = 7;
              if(number_of_classes > classLimit){ //check to see if user has too many classes filled out
                sendData(ws, ["err", "You\'ve signed up for " +  number_of_classes + " classes, the limit on this website for now is " + classLimit +"."])
              }
              else{
                var texted = "false";
                var query = "INSERT INTO clients_and_their_info VALUES (";
                var params = [];
                for(var i = 1; i < data.length; i++){
                  query += "$"+((i-1)*10 + 1)+",$"+((i-1)*10 + 2)+",$"+((i-1)*10 + 3)+",$"+((i-1)*10 + 4)+",$"+((i-1)*10 + 5)+",\'"+texted+"\',$"+((i-1)*10 + 6)+",$"+((i-1)*10 + 7)+",$"+((i-1)*10 + 8)+",$"+((i-1)*10 + 9)+",$"+((i-1)*10 + 10)+")";
                  for(var k in data[i]){
                    if(typeof data[i][k] != typeof function(){})
                      params.push(data[i][k])
                  }
                  console.log(params);
                  if(i+1 == data.length) query += ";"
                  else query += ", ("
                }
                console.log(query);
                sendQuery(query, params, function(result){
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
                    var temp = [];
                    var q = "SELECT inst, session, dept, class, section,texted from clients_and_their_info where user_id=$1;"
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
                      if(data.length == 2){
                          sendData(ws,["sendNotification", "Your have succesfully added "+data[1][2] +": "+ data[1][3]])
                      }
                      else{
                        var temp = ""
                        for(var i = 1; i < data.length; i++){
                          temp += data[i][2] +": "+ data[i][3] + ", ";
                        }
                        temp[temp.length-1] = "";
                            sendData(ws,["sendNotification"], "Your have succesfully added "+temp)
                      }
                      
                    });
                    //sendData(ws, ["Success", "Your classes have succesfully been entered"])
                    console.log("Success adding query");
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
  	if (socket.readyState != socket.OPEN) { //check if socket is open before sending
      	console.error('Client state is ' + socket.readyState);
      //or any message you want
  	} else {
  	    socket.send(JSON.stringify(data)); //send data to client
  	}
  }
  function checkForEmptyData(data,callback, socket){
  	for(var d in data){
      if(data[d] == ""){
        sendData(socket,["err", "One of your fields is empty, if this is a mistake, please contact support"])
        return false;
      }
      try{
        for(var e in data[d]){
      		if(data[d][e] == ""){
            sendData(socket, "One of your fields is empty, if this is a mistake, please contact support")
            return false;
          }
        }
      } catch(err){

      }
  	}
  	callback(data)
  }
}
var sent = false; 
module.exports = function(wss,request){
  wss.on("connection", function(ws) {
    var q = "SELECT inst, session, dept, class, section from clients_and_their_info where user_id=\'"+request.user.username+"\';"
    sendQuery(q,function(result){
      var temp = [];
      result = result.rows
      for(var row in result){
        temp.push(result[row])
      }
      sendData(ws,["classesBeingTaken",temp]);
    })
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
            var q = "DELETE FROM clients_and_their_info WHERE user_id=\'" + request.user.username +"\' and inst=\'"+ data[1][0] +"\' and session=\'"+data[1][1] +"\' and dept=\'"+data[1][2] +"\' and class=\'"+data[1][3] +"\' and section=\'"+data[1][4] +"\';"
            console.log(q);
            sendQuery(q, function(result){
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
    		else if(data[0] == "submit"){
    			checkForEmptyData(data, function(data){
            var q = "SELECT count(*) from clients_and_their_info where user_id = \'" + data[1][7] + "\';"
            sendQuery2(q, function(result){
              var number_of_classes = parseInt(result.count)+data.length;
              if(number_of_classes > 500){ //check to see if user has too many classes filled out
                sendData(ws, ["err", "You\'ve signed up for " +  number_of_classes + " classes, the limit on this website for now is 5."])
              }
              else{
                var texted = "false";
                var query = "INSERT INTO clients_and_their_info VALUES (\'";
                for(var i = 1; i < data.length; i++){
                  query += data[i][0]+"\', \'"+data[i][1]+"\', \'"+data[i][2]+"\', \'"+data[i][3]+"\', \'"+data[i][4]+"\', \'"+texted+"\', \'"+data[i][5]+"\', \'"+data[i][6]+"\', \'"+data[i][7]+"\', \'"+data[i][8]+"\')";
                  if(i+1 == data.length) query += ";"
                  else query += ", (\'"
                }
                console.log(query);
                sendQuery(query, function(result){
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
                    for(var i = 1; i < data.length; i++){
                      temp.push([data[i][1],data[i][6],data[i][2],data[i][3],data[i][4]]);
                    }
                    sendData(ws, ["AddedAClass", temp])
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
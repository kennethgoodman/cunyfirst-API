 module.exports = function(wss){
  wss.on("connection", function(ws) {
    var id = setInterval(function() {
      ws.send(JSON.stringify(["keep open",new Date()]), function() {})
    }, 2500) //to keep connection open
    console.log("websocket connection open")
    ws.on("close", function() {
      console.log("websocket connection close")
      clearInterval(id)
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
    		else if(data[0] == "submit"){
    			checkForEmptyData(data, function(data){
  	  			var texted = "false";
  	  			var query = "INSERT INTO clients_and_their_info VALUES (\'"+data[1]+"\', \'"+data[2]+"\', \'"+data[3]+"\', \'"+data[4]+"\', \'"+data[5]+"\', \'"+texted+"\', \'"+data[6]+"\', \'"+data[7]+"\', \'"+data[8]+"\', \'"+data[9]+"\');";
  				console.log(query);
  				sendQuery(query, function(result){
  					console.log(result)
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
  function checkForEmptyData(data,callback){
  	for(var d in data){
  		if(data[d] == ""){
  			return false;
  		}
  	}
  	callback(data)
  }
}
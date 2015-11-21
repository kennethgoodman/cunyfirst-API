var dotenv = require('dotenv')
dotenv.load();
var morgan = require('morgan')
var pg = require('pg');
var car = require('./carrier')
var worker = require('./worker');
var bot = require('./bot')
var mainLoop = require('./mainLoop')
var WebSocketServer = require("ws").Server
var http = require('http');
var express = require('express');
var stormpath = require('express-stormpath');
var app = express();
var port = process.env.PORT || 5000
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(stormpath.init(app, {
  client: {
    apiKey: {
      id: process.env.STORMPATH_API_KEY_ID,
      secret: process.env.STORMPATH_API_KEY_SECRET,
    }
  },
  web: {
  	register: {
  		fields: {
  			name:{
  				required: false
  			},
  			"phone number":{
  				required: false
  			}
  		},
  		//fieldOrder: [ "test","data","nbr","name","email", "password", "passwordConfirm" ],
  		//fieldOrder: [ ]
  	}
  },
  application: {
    href: process.env.STORMPATH_URL
  },
  website: true
}));
app.use(morgan('combined'))
var wss;
var server = http.createServer(app)
server.listen(port)
var wss = new WebSocketServer({server: server})
app.on('stormpath.ready', function() {
  //app.listen(process.env.PORT || 5000);
  	
});
app.use(express.static(__dirname + '/public'));
app.get('/', stormpath.loginRequired, function(request, response) {
  	response.render('pages/index',{options: ['inst','session','dept','class_nbr', 'section','your_phone_number'],userInfo: request.user});
});
app.get('/db', stormpath.groupsRequired(['Admin']),function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM clients_and_their_info', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('pages/db', {results: result.rows} ); }
    });
  });
})
wss.on("connection", function(ws) {
  var id = setInterval(function() {
    ws.send(JSON.stringify(new Date()), function() {  })
  }, 1000000)
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
// app.js
var pg = require('pg');

var worker = require('./worker');
/*var dotenv = require('dotenv')
dotenv.load();*/
var bot = require('./bot')
var mainLoop = require('./mainLoop')
var WebSocketServer = require("ws").Server
var http = require('http');
var express = require('express');
var app = express();
var port = process.env.PORT || 5000
var stormpath = require('express-stormpath');
var server = http.createServer(app)
server.listen(port)
console.log("http server listening on %d", port)

var wss = new WebSocketServer({server: server})
console.log("websocket server created")


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(stormpath.init(app, {
	enableAccountVerification: true,
	website: true,
	enableForgotPassword: true,
	  apiKeyId:     process.env.STORMPATH_API_KEY_ID,
	  apiKeySecret: process.env.STORMPATH_API_KEY_SECRET,
	  secretKey:    process.env.STORMPATH_SECRET_KEY,
	  application:  process.env.STORMPATH_URL,
}));
app.use(express.static(__dirname + '/public'));
/*app.on('stormpath.ready', function () {
  app.listen((process.env.PORT || 5000));
});*/
app.get('/', stormpath.loginRequired, function(request, response) {
  	response.render('pages/index',{options: ['inst','session','dept','class_nbr', 'section','your_phone_number'],userInfo: request.user});
});

app.get('/account', stormpath.loginRequired, function(request,response){
	response.render('pages/account', {userInfo: request.user});
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
  				ws.send(JSON.stringify(a))
  			})
  		}
  		else if(data[0] == "get_session"){
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
  				ws.send(JSON.stringify(a))
  			})
  		}
  		else if(data[0] == "get_dept"){
  			var a = ["dept"];
  			getDept(data[1],data[2],function(data){
  				a.push(data);
  				ws.send(JSON.stringify(a))
  			})
  		}
  		else if(data[0] == "get_class"){
  			var a = ["class_nbr"];
  			getSections(data[1],data[2],data[3], function(data){
  				a.push(data);
  				ws.send(JSON.stringify(a));
  			})
  		}
  		else if(data[0] == "get_section"){

  		}
  		else if(data[0] == "submit"){
  			var texted = "false";
  			var query = "INSERT INTO clients_and_their_info (\'"+data[1]+"\', \'"+data[2]+"\', \'"+data[4]+"\', \'"+data[5]+"\', \'"+data[6]+"\', \'"+texted+"\', \'"+data[7]+"\', \'"+data[3]+"\');";
			console.log(query);
			//send query
			//
  		}
  		//else: exit           
    });
})

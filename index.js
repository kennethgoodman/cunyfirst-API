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
var websocket = require('./websocket')
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
    /*
  	register: {
      fields:{
        phone_number: {
          required: false
        },
        name: {
          required: false
        },
        email:{
          required: true
        },
        password:{
          required: true
        }
      },
  		fieldOrder: [ "test","phone_number","name","email", "password", "passwordConfirm"],
  		//fieldOrder: [ ]
  	}*/
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
app.get('/userData', function(req, res){
  res.send(req.user)
})
var created = false;
app.get('/', function(request, response) {
  	//sendQuery2("SELECT inst, session, dept, class, section from clients_and_their_info where user_id=\'"+request.user.username+"\';",function(result){
    response.render('pages/index');
    if(!created){
      created = true;
      websocket(wss,request, request.user != undefined);
    }
    /*request.user.getCustomData(function(err,data){
      
      }  
    });*/
});
app.get('/account', stormpath.loginRequired, function(request,response){
  response.render('pages/account', {userInfo: request.user})
})
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
app.get('/faq', function(request,response){
  response.render('pages/faq');
})

/*
var dotenv = require('dotenv')
dotenv.load();
*/
var morgan = require('morgan')
var pg = require('pg');
require('./carrier')
require('./worker');
//require('./bot')
require('./mainLoop')
var assert = require('assert')
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
var raygun = require('raygun');
var raygunClient = new raygun.Client().init({ apiKey: process.env.RAYGUN_APIKEY });
app.use(raygunClient.expressHandler);
try{
  var err = new Error('help!');
  //throw err;
} catch(err){
  raygunClient.send(err)
}
var session = require('express-session');
app.use(session({
  store: new (require('connect-pg-simple')(session))(),
  secret: 'My super secret password for sessions !#@$^53',
  cookie: { 
    maxAge: 30 * 24 * 60 * 60 * 1000,
    secure: true,
    httpOnly: true,
    }, // 30 days
  resave: false,
  saveUninitialized: false,
}));
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
  website: true,
}));
app.use(raygunClient.expressHandler);
app.use(morgan('combined'))
var server = http.createServer(app)
server.listen(port)
var wss = new WebSocketServer({server: server})
app.on('stormpath.ready', function() {
  //app.listen(process.env.PORT || 5000);
});
app.use(express.static(__dirname + '/public'));
try{
  app.get('/userData', function(req, res){
    res.send(req.user)
  })
} catch(err){
  console.log(err)
}
app.get('/', function(request, response) {
  	//sendQuery2("SELECT inst, session, dept, class, section from clients_and_their_info where user_id=\'"+request.user.username+"\';",function(result){
    //
    response.render('pages/index');
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
      if (err){ 
        console.error(err); response.send("Error " + err); 
      }
      else{ 
        response.render('pages/db', {results: result.rows} ); 
      }
    });
  });
})
app.get('/faq', function(request,response){
  response.render('pages/faq');
})
app.get('/account_info', stormpath.loginRequired, function(request,response){
  var q = "Select phone_number from users where user_id = $1";
  sendQuery2(q, [request.user.username], function(row){
    response.render('pages/account_info',{userInfo: request.user, phone_number: row.phone_number})
  })
})
app.get('/donate', function(request,response){
  response.render('pages/donate')
})
app.get('*', function(req,res,next){
  var err = new Error();
  err.status = 404;
  next(err)
})
app.use(function(err, req, res, next){
  if(err.status !== 404){
    console.log(err);
    //return next();
  }
  console.log(err)
  res.send(err.message || 'There is no page at this link')
})
websocket(wss);

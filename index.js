const WEBSITE_DOWN = false;
try{
	var dotenv = require('dotenv')
	dotenv.load();
}catch(err){
	//do nothing if this fails, we are in dev
}
/*********************** other js files in this directory ******************************/
require('./mainLoop');
require('./carrier');
require('./worker');
require('./cronJobs');
var websocket = require('./websocket');
/***************************************************************************************/

/*********************** npm modules in use ********************************************/

var pg = require('pg'); // for postgres access
var assert = require('assert');
var WebSocketServer = require('ws').Server; // to send messeges easily between client and server
var http = require('http'); // for creating the server
var express = require('express'); // for creating the application, classic lib for node
var session = require('express-session');
var app = express();
var raygun = require('raygun'); //for error handling 
/***************************************************************************************/


/*********************** set up server ********************************************/
var port = process.env.PORT || 5000;
app.set('views',__dirname + '/views'); // basically for the views folder
app.set('view engine', 'ejs'); // use ejs as the generating js engine
app.use(express.static(__dirname + '/public'));
app.use("/favicon.ico", express.static(__dirname+'/public/images/favicon.ico'));

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

var server = http.createServer(app)
server.listen(port)

var wss = new WebSocketServer({server: server})
/**********************************************************************************/


/*********************** set up raygun ********************************************/
var raygunClient = new raygun.Client().init({ apiKey: process.env.RAYGUN_APIKEY });
app.use(raygunClient.expressHandler);
/**********************************************************************************/



if(WEBSITE_DOWN || process.env.WEBSITE_DOWN == "DOWN"){
  app.get('*', function(req,res,next){ //if the website is down, no matter who it is, no matter what link, send to maintenance page
    res.render('pages/maintenance');
  })
}

/****************************** Different Website Links ***************************/
app.get('/', function(request,response){
    response.render('pages/index');
})
app.get('/faq', function(request,response){
    response.render('pages/faq');
})
app.get('/donate', function(request,response){
  response.render('pages/donate')
})
app.get('/db', function(request, response) { //NEED TO PROTECT THIS
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
  })
});

app.get('*', function(req,res,next){ //for all other attempts
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
  res.send(err.message || 'There is no page at this link') //error is 404, Maybe create a 404 ejs page
})
/**********************************************************************************/


websocket(wss); //set up the websocket


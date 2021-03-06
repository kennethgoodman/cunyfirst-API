const WEBSITE_DOWN = false;
global.CUNYFIRST_DOWN = false
try{
	var dotenv = require('dotenv')
	dotenv.load();
}catch(err){
	//do nothing if this fails, we are in dev
}
/*********************** npm modules in use ********************************************/
var pg = require('pg'); // for postgres access
var assert = require('assert');
var WebSocketServer = require('ws').Server; // to send messeges easily between client and server
var http = require('http'); // for creating the server
var express = require('express'); // for creating the application, classic lib for node
var session = require('express-session');
var app = express();
var raygun = require('raygun'); //for error handling 
var pgSession = require('connect-pg-simple')(session);
var logger = require('tracer').console({
                  format : [ "<{{title}}> {{file}}:{{line}}: {{message}}", {error: "<{{title}}> {{file}}:{{line}}: {{message}} \nCall Stack: {{stack}}"}],
                  preprocess: function(data){ data.title = data.title.toUpperCase()}
              })
global.logger = logger
/***************************************************************************************/



/*********************** other js files in this directory ******************************/
require('./database');
require('./mainLoop');
require('./carrier');
require('./serverSideVariables')
require('./worker');
require('./cronJobs');
var websocket = require('./websocket');
/***************************************************************************************/



/*********************** set up server ********************************************/
var port = process.env.PORT || 5000;
app.set('views',__dirname + '/views'); // basically for the views folder
app.set('view engine', 'ejs'); // use ejs as the generating js engine
app.use(express.static(__dirname + '/public'));
app.use("/favicon.ico", express.static(__dirname+'/public/images/favicon.ico'));

app.use(session({ 
  store: new pgSession({
    pg: pg,
    tableName: 'user_session_table'
  }),
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
app.get('/indexTest', function(request,response){
    response.render('pages/index');
});
app.get('/', function(request,response){
    response.render('pages/sign_up_to_get_texted');
});
app.get('/faq', function(request,response){
    response.render('pages/faq');
})
app.get('/donate', function(request,response){
    response.render('pages/donate')
})
app.get('/api/getSchools', function(req, res) {
  if(addIPAddress(req,'/api/schools')){
    getInstitutionsGlobal( function(data){
      res.end( JSON.stringify( data ) )
    })
  } else {
    res.end( JSON.stringify({"Error": "Too many times"}))
  }
})
app.get('/api/getClasses/', function(req,res){
  if(addIPAddress(req,'/api/getClasses/')){
    inst = req.query.institution
    session = req.query.session
    getClassesWTopic([inst,session],'classes_1',function (data) {
        res.end( JSON.stringify( data ))
    });
  } else {
    res.end( JSON.stringify({"Error": "Too many times"}))
  }
})
app.get('/api/RMP/', function(req,res) {
  if(addIPAddress(req,'/api/RMP/')){
    institution = req.query.institution
    teacher = req.query.teacher
    getTeacherInfo([institution,teacher], function(data){
      res.end( JSON.stringify( data ))
    })
  } else {
    res.end( JSON.stringify({"Error": "Too many times"}))
  }
})
app.get('/courseScheduler', function(request, response){
  response.render('pages/courseScheduler')
})

app.get('*', function(req,res,next){ //for all other attempts
  var err = new Error();
  err.status = 404;
  next(err)
})
app.use(function(err, req, res, next){
  if(err.status !== 404){
    logger.error(err);
    //return next();
  }
  logger.error(err)
  res.send(err.message || 'There is no page at this link') //error is 404, Maybe create a 404 ejs page
})
/**********************************************************************************/
addressThreshold = 5
remoteAddresses = {}
addIPAddress = function(req,path){
  remoteAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  logger.info('remoteAddress: ' + remoteAddress + ' called ' + path + ' with params: ')
  logger.info(req.query)
  if(remoteAddress in remoteAddresses){
    remoteAddresses[remoteAddress] += 1
  } else {
    remoteAddresses[remoteAddress] = 1
  }
  return remoteAddresses[remoteAddress] <= addressThreshold;
}
setInterval( function(){ remoteAddresses = {} }, 1000*60) // every hour restart
websocket(wss); //set up the websocket


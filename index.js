var morgan = require('morgan')
var pg = require('pg');
var car = require('./carrier')
var worker = require('./worker');
//var bot = require('./bot')
//var mainLoop = require('./mainLoop')
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
var websocket = require('./websocket')
websocket(wss);

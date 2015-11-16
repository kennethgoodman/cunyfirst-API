// app.js
var pg = require('pg');
/*var dotenv = require('dotenv')
dotenv.load();*/

var express = require('express');
var stormpath = require('express-stormpath');

var app = express();
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
app.on('stormpath.ready', function () {
  app.listen((process.env.PORT || 5000));
});
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
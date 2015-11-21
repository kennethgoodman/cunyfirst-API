var Heroku = require('heroku-client'),
    heroku = new Heroku({ token: "a6e0511d-0109-4209-b8c3-31f3f9e02273" });

var app = heroku.apps('noclosedclass');

app.info(function (err, app) {
	console.log(app)
  // Details about the `app`
});

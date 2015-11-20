var dotenv = require('dotenv')
dotenv.load();
var express = require('express');
var stormpath = require('express-stormpath');

var app = express();

app.use(stormpath.init(app, {
  client: {
    apiKey: {
      id: process.env.STORMPATH_API_KEY_ID,
      secret: process.env.STORMPATH_API_KEY_SECRET,
    }
  },
  application: {
    href: process.env.STORMPATH_URL
  },
  website: true
}));

app.on('stormpath.ready', function() {
  app.listen(process.env.PORT || 3000);
});
var Heroku = require('heroku.node');

var client = new Heroku({email: 'kennethsgoodman@yahoo.com', api_key: 'a6e0511d-0109-4209-b8c3-31f3f9e02273'});
// Do something with client

client.app('noclosedclass').dynos.list(function(err,dyno){
	client.app('noclosedclass').dyno(dyno[0].id).restart(function(e,f,g){
	})
})
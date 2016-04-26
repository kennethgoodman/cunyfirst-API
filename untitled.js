var pg = require('pg');
	pg.connect('postgres://:@localhost/cuny_first_db', function(err, client, done) {
			if (err) {
			  console.log(err);
			  pg.end();
			  return;
			}
			console.log('Connected to postgres! Getting schemas...');
			client.query('SELECT * from schools', function(err, result) {
		    if(err) {
				   err["Error"] = true;
				   console.error('error running query', err)
				   client.end();
			}
		    else{
				 console.log(result)
				 done()
		    }
		})
	})
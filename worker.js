try{
    var dotenv = require('dotenv')
    dotenv.load();
}catch(err){
    //do nothing if this fails, we are in dev
}
require('./worker 2')
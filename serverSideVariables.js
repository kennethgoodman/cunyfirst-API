/************** common files **************/
require('./database');

/************** common files **************/


/************** Initialization **************/
global.list_of_insts_and_sessions = []
global.counter_for_list_of_insts_and_session = 0
/************** Initialization **************/


/************** starting values *************/
getInstitutions(function(result){
	global.list_of_insts_and_sessions = result
})
/************** starting values *************/

/************** getters *****************/
getInstitutionsGlobal = function(callback){
	callback(global.list_of_insts_and_sessions)
	global.counter_for_list_of_insts_and_session++
}


/************** updated variables *****************/
var inst_and_session_interval = setInterval(function (argument) {
	getInstitutions(function(result){
		if(result != []){
			global.list_of_insts_and_sessions = result //else keep it
		}
	})
}, 1000 * 60 * 60) //once an hour



var worker = require('./worker');


/*(function myLoop (i) {          
   setTimeout(function () {   
      alert('hello');          //  your code here                
      if (--i) myLoop(i);      //  decrement i and call myLoop again if i > 0
   }, 3000)
})(10); */


/*getInst(function(q){
	for (i in q){
		
		setTimeout ( getSession('QNS01', function (r, m){
			console.log(i)
			console.log(m)
			console.log("____________________________")
			console.log("____________________________")
		}), 1000*60)
	}

})*/

allClasses = function (){
	getInst(function(inst){
		var institutionsArray= []
		for (i in inst){
			institutionsArray.push(i)
		}

		allSessions(institutionsArray, function (array){
			allSubjects (array, function(array1){
				console.log(array1)
				console.log("there are "+array1.length + " stuffs ")
			})
		})
	});
}

allSessions = function (institutions, callback){
	var sessionArray= []
	var s= function sessionLoop (i) {      
   		setTimeout(function () {   
      		getSession(institutions[--i], function (r, m){
				for (j in m){
					var item = {inst: institutions[i], session: m[j]}
					sessionArray.push(item)
				}
			})              
   			if (i>-1) sessionLoop(i);      //it's i>-1 because this way it'll try to iterate an extra time before the callback, buying us an extra 3 seconds
   			else callback(sessionArray)
   		}, 1000*3)
	}; 
	s(institutions.length)
}


allSubjects = function (array, callback){
	var classArray= []
	var s= function sessionLoop (i) {      
   		setTimeout(function () {   
   			if (i>0){
   				getDept(array[--i].inst, array [i].session, function (m){
					for (j in m){
						var item = {inst: array[i].inst, session: array[i].session, subject: m[j]}
						classArray.push(item)
					}
				})   
   			} 
   			else{
   				i--
   			} 
   			if (i>-1) sessionLoop(i);      //it's i>-1 because this way it'll try to iterate an extra time before the callback, buying us an extra 3 seconds
   			else callback(classArray)
   		}, 1000*3)
	}; 
	s(array.length)
}

allClasses()

//getSections('QNS01', '1169', 'PHYS', function (m){
//	console.log(m)
//})



weekends = ["FRI","SAT","SUN"]
weekdays = ["MON","TUE","WED","THUR"]
TimeElapsed = function(first,second){

}
TimeBetween = function(first, second){

}
findSoftScore = function(schedule, debug){
	model = { 
			  "daysOfWeekScoreModifier" 		  	       : -1,
			  "weekendsScoreModifier"   		  	       : -1,
			  "morningClassesScoreModifier"     	       : -1,
			  "teacherScoreModifier"					   : 1,
			  "late_nights_follow_by_early_morningModifier": -1
			}
	schedule.sort()
	schedule = new ClassesByDay(schedule.getListOfClasses())
	var days_of_the_week_count = [0,0,0,0,0,0,0]
	var morningClasses = 0
	var teacherScore = 0
	var day_of_the_week_count = 0
	var length_of_time_school = new Time(0,0)
	var num_of_major_classes = 0
	var late_nights_follow_by_early_mornings = 0
	
	/*lastClass = undefined
	for(var i = 0; i < 7; i++){
		if(schedule[6-i].length > 0){
			lastClass = 
		}
	}*/
	for(var i in schedule.listOfClasses){
		var theClassesOnDay = schedule.listOfClasses[i]
		var amountOfClassesOnDay = theClassesOnDay.length()
		if(amountOfClassesOnDay > 0){
			days_of_the_week_count[ day_of_the_week_count ] = amountOfClassesOnDay
			day_of_the_week_count += 1

			length_of_time_school += TimeElapsed(theClassesOnDay[0], theClassesOnDay[amountOfClassesOnDay - 1])

			//if(lastClass)


		}
		else{
			lastClass = undefined
		}

		for(var j in theClassesOnDay.listOfCunyClasses){
			var theClass = theClassesOnDay.listOfCunyClasses[j]
			if(theClass.isMorning()){
				morningClasses += 1
			}
			if(theClass.teacherScore != undefined){
				teacherScore += theClass.teacherScore
			}
		}
	}

	var how_many_days = 0
	var how_many_on_weekends = 0
	for(var i in days_of_the_week_count){
		if(days_of_the_week_count[i] > 0){
			how_many_days += 1
			if(i == 0 || i == 5 || i == 6) how_many_on_weekends += 1
		}
	}

	//late_nights_follow_by_early_mornings_score = late_nights_follow_by_early_mornings * model['late_nights_follow_by_early_morningModifier']
	teacherScore *= 									model['teacherScoreModifier']
	var daysOfWeekScore = (how_many_days - 4) *             model['daysOfWeekScoreModifier']
	var weekendsScore = how_many_on_weekends     		  * model['weekendsScoreModifier']
	var morningClassesScore = morningClasses     	      * model['morningClassesScoreModifier']
	softScore = daysOfWeekScore + weekendsScore + morningClassesScore + morningClassesScore //+ late_nights_follow_by_early_mornings_score
	if(debug){
		console.log(how_many_days)
		console.log(daysOfWeekScore)
		console.log(weekendsScore)
		console.log(morningClassesScore)
		console.log(morningClassesScore)
		console.log(schedule)
	}
	return softScore
}
hardScoreBreak = function(schedule){
	listOfClasses = schedule.getListOfClasses()
	len = listOfClasses.length
	for(var i in listOfClasses){
		i = parseInt(i)
		var thisClass = listOfClasses[i]
		for(var j = i + 1; j < len; j++){
			var otherClass = listOfClasses[j]
			if(thisClass.overlap(otherClass)){
				console.log("hardScoreBreak, classes overlap each other")
				return true
			}
			if(thisClass.dept == otherClass.dept && thisClass.number == otherClass.number){
				console.log("hardScoreBreak, dept == dept and number == number")
				console.log(thisClass.number)
				console.log(otherClass.number)
				return true
			}
		}
	}
	return false
}
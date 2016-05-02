weekends = ["FRI","SAT","SUN"]
weekdays = ["MON","TUE","WED","THUR"]
days = { "SUN":0, "MON":1, "TUE":2, "WED":3,"THUR":4,"FRI":5, "SAT":6 }
class ClassesByDay{
	constructor(cunyclasses){
		this.listOfClasses = [ [], [], [], [], [], [], [] ]
		for(var c in cunyclasses){
			daysOfWeek = cunyclasses[c].daysOfWeek
			for(var d in daysOfWeek){
				var o = JSON.parse(JSON.stringify(cunyclasses[c]))
				var copied = new CunyClass(o["dept"],o["number"],o["daysOfWeek"],new Section(
										new Class_Time( new Time(o["section"]["class_time"]["startTime"]["hour"], o["section"]["class_time"]["startTime"]["minute"]), 
														new Time(o["section"]["class_time"]["endTime"]["hour"]  , o["section"]["class_time"]["endTime"]["minute"])),
										   o["section"]["number"]),o["teacher"],o["teacherScore"])
				copied.daysOfWeek = [daysOfWeek[d]]
				this.listOfClasses[days[daysOfWeek[d]]].push(copied)
			}
		}
		for(var c in this.listOfClasses){
			this.listOfClasses[c] = new CunyClasses(this.listOfClasses[c])
			this.listOfClasses[c].sort()
		}
	}
	[Symbol.iterator](){
	 	return this.listOfClasses
	}
}
ClassesByDay.prototype.getItem = function(i){
	return this.listOfClasses[i]
}
ClassesByDay.prototype.toString = function(){
	str = ""
	for(var c in this.listOfClasses){
		str += this.listOfClasses[c].toString() + "\n"
	}
	return str
}
weekends = ["FRI","SAT","SUN"]
weekdays = ["MON","TUE","WED","THUR"]
days = { "SUN":0, "MON":1, "TUE":2, "WED":3,"THUR":4,"FRI":5, "SAT":6 }
class ClassesByDay{
	constructor(cunyclasses){
		this.listOfClasses = [ [], [], [], [], [], [], [] ]
		for(var c in cunyclasses){
			var o = JSON.parse(JSON.stringify(cunyclasses[c]))
			for(var i in o["section"]["class_time"]){
				var dayOfWeek = o["section"]["class_time"][i]["day"]
				var class_times = []
				var startTime = new Time(o["section"]["class_time"][i]["startTime"]["hour"], o["section"]["class_time"][i]["startTime"]["minute"])
				var endTime   = new Time(o["section"]["class_time"][i]["endTime"]["hour"]  , o["section"]["class_time"][i]["endTime"]["minute"])
				var day       = o["section"]["class_time"][i]["day"]
				class_times.push(new Class_Time(startTime, endTime, day))
				var newSection = new Section(class_times, o["section"]["number"])
				var copied = new CunyClass(o["dept"],o["number"],dayOfWeek,newSection,o["teacher"],o["teacherScore"])
				this.listOfClasses[days[dayOfWeek]].push(copied)
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
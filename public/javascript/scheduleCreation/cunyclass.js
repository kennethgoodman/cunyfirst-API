weekends = ["FRI","SAT","SUN"]
weekdays = ["MON","TUE","WED","THUR"]
days = { "SUN":0, "MON":1, "TUE":2, "WED":3,"THUR":4,"FRI":5, "SAT":6 }
class CunyClass{
	constructor(dept, num,daysOfWeek, section,teacher, teacherScore){
		this.dept = dept
		this.number = num
		this.daysOfWeek = daysOfWeek
		this.section = section
		this.teacher = teacher
		this.teacherScore = teacherScore
	}
	overlap(other){
		return this.section.overlap(other.section)
	}
	isMorning(){
		return this.section.isMorning()
	}
	isOn(d){
		return days[d] != undefined
	}
	howManyOnWeekday(){
		count = 0
		for(var d in this.daysOfWeek){
			var day = daysOfWeek[d].toUpperCase()
			for(var we in weekends){
				if(weekends[we] == day){
					count += 1
					break
				}
			}
		}
		return count
	}
	lessThen(o){
		return this.section.lessThen(o.section)
	}
	lessThenOrEqual(o){
		return this.section.lessThenOrEqual(o.section)
	}
	greaterThen(o){
		return this.section.greaterThen(o.section)
	}
	greaterThenOrEqual(o){
		return this.section.greaterThenOrEqual(o.section)
	}
}
CunyClass.prototype.equals =function(other){
	return this.dept == other.dept && this.number == other.number && this.section == other.section
}
CunyClass.prototype.toString =function(){
	return "Dept: " + dept.toString() +"\n" + "number: " + number.toString() +"\n" + "daysOfWeek: " + daysOfWeek.toString() +"\n" + "section: " + section.toString() +"\n"
}
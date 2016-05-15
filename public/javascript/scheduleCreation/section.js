class Section{
	constructor(class_times, number){
		this.class_time = class_times
		this.number = number
	}
	getClassTime(){
		return this.class_time
	}
	getNumber(){
		return this.number
	}
	isMorning(){
		for(var i in this.class_time){
			if(this.class_time[i].isMorning())
				return true
		}
		return false
	}
	overlap(b){
		for(var i in this.class_time){
			for(var j in b.class_time){
				if( this.class_time[i].overlap(b.class_time[j])){
					return true
				}
			}
		}
	}
	lessThen(b){
		return this.class_time.lessThen(b.getClassTime())
	}
	lessThenOrEqual(b){
		return this.class_time.lessThenOrEqual(b.getClassTime())
	}
	greaterThen(b){
		return this.class_time.greaterThen(b.getClassTime())
	}
	greaterThenOrEqual(b){
		return this.class_time.greaterThenOrEqual(b.getClassTime())
	}
}
Section.prototype.equals = function(other){
	return "ClassTime: " + this.class_time.toString() + " \nNumber: " + this.number.toString() + "\n"
}
Section.prototype.equals = function(other){
	return this.class_time == other.getClassTime() && this.number == other.getNumber()
}
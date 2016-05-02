class Section{
	constructor(class_time, number){
		this.class_time = class_time
		this.number = number
	}
	getClassTime(){
		return this.class_time
	}
	getNumber(){
		return this.number
	}
	isMorning(){
		return this.class_time.isMorning()
	}
	overlap(b){
		return this.class_time.overlap(b.getClassTime())
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
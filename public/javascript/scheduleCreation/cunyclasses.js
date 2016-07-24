class CunyClasses{
	constructor(listOfCunyClasses){
		this.listOfCunyClasses = listOfCunyClasses
	}
	length(){
		return this.listOfCunyClasses.length
	}
}
CunyClasses.prototype.getItem = function(i){
	return this.listOfClasses[i]
}
CunyClasses.prototype.toString = function(){
	str = ""
	for(var c in this.listOfCunyClasses){
		str +=  this.listOfCunyClasses[c].toString() + "\n"
	}
	return str
}
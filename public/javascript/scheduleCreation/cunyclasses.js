class CunyClasses{
	constructor(listOfCunyClasses){
		this.listOfCunyClasses = listOfCunyClasses
	}
	sort(){
		this.listOfCunyClasses.sort(dynamicSort())
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
function dynamicSort() {
	//console.log(a)
    return function (a,b) {
        var result = (a.section.Class_Time < b.section.Class_Time ? -1 : (a.section.Class_Time > b.section.Class_Time) ? 1 : 0);
        return result;
    }
}
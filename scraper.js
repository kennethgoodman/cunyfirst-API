var rmp = require("rmp-api");
var db = require('./database')
queue = []
var callback = function(professor) {
  if (professor === null) {
    //console.log("No professor found.");
    return;
  }
  /*
  console.log("Name: " + professor.fname + " " + professor.lname);
  console.log("University: "+ professor.university);
  console.log("Quality: " + professor.quality);
  console.log("Easiness: " + professor.easiness);
  console.log("Helpfulness: " + professor.help);
  console.log("Average Grade: " + professor.grade);
  console.log("Chili: " + professor.chili);
  console.log("URL: " + professor.url);*/
  sendQuery("Insert into ratemyprofessor (inst, name, quality, easyness, helpfulness, avggrade, chili, url) values ($1,$2,$3,$4,$5,$6,$7,$8)",
          [professor.university,professor.fname + " " + professor.lname, professor.quality,professor.easiness,professor.help, professor.grade,professor.chili,professor.url ],
          function(data){//console.log(data)
          })
  //console.log("First comment: " + professor.comments[0]);
};

var QC = rmp("CUNY Queens College")


sendQuery("select distinct schools.name, classes.teacher from classes, schools where classes.school = schools.id and schools.name = $1", ["Queens College"], function(data){
  data = data["rows"]
  var i = 0;
  var a = setInterval(function(){
    console.log(i)
    if(i >= data.length)
      clearInterval(a)
    else
      QC.get(data[i++]["teacher"],callback)

  },1500)
})
// Make sure we got a filename on the command line.


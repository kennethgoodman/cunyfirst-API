var rmp = require("rmp-api");
var db = require('./database')
queue = []
var callback = function(professor) {
  if (professor === null) {
    //console.log("No professor found.");
    return;
  }
  var college = "City College";
  var name = professor.fname + " " + professor.lname;
  sendQuery("Insert into ratemyprofessor (inst, name, quality, easyness, helpfulness, avggrade, chili, url) values ($1,$2,$3,$4,$5,$6,$7,$8)",
          [college,name, professor.quality,professor.easiness,professor.help, professor.grade,professor.chili,professor.url ],
          function(data){})
};
var callbackConsole = function(professor) {
  if (professor === null) {
    console.log("No professor found.");
    return;
  }
  console.log("Name: " + professor.fname + " " + professor.lname);
  console.log("University: "+ professor.university);
  console.log("Quality: " + professor.quality);
  console.log("Easiness: " + professor.easiness);
  console.log("Helpfulness: " + professor.help);
  console.log("Average Grade: " + professor.grade);
  console.log("Chili: " + professor.chili);
  console.log("URL: " + professor.url);
  //console.log("First comment: " + professor.comments[0]);*/
};
var BC = rmp("City College")
BC.get("Ann Yali", callback)/*
//BC.get("Margrethe Horlyck-Romanovsky", callback)
//BC.get("Vijayalakshmi (Viju) Raghupathi", callback)
//BC.get("Noureddin Amaach", callback)
//BC.get("Thomas Bock", callback)
//BC.get("Irene Soto Marin", callback)

sendQuery("select distinct schools.name, classes.teacher from classes, schools where classes.school = schools.id and schools.name = $1", ["City College"], function(data){
  data = data["rows"]
  console.log(data.length)
  var i = 1118 ;
  var a = setInterval(function(){
    if(i%10 == 0)
      console.log(i)
    if(i++ >= data.length)
      clearInterval(a)
    else
      try{
        //console.log(data[i])
        BC.get(data[i]["teacher"],callback)
      }catch(err){
        console.log(i)
        console.log("There was an error:")
        console.log(data[i - 1])
        console.log(err)
      }
  },1500)
})
//*/

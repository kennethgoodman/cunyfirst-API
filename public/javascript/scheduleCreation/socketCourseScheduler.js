//hiddenRowData = {}
var host = location.origin.replace(/^http/, 'ws')
var ws = new WebSocket(host);
ws.onmessage = function (event) {
  var data = JSON.parse(event.data);
  try{
      var commandFromServer = data[0]
      if(commandFromServer == "keep open") return; //dont print, this is just a message to keep the websocket open
      console.log(commandFromServer)
      if(commandFromServer == "inst"){
        //$("#ajax-loader").hide();
        var keys = data[1];
        var dropdown = document.getElementById('inst');
        for(var i = 0; i < keys.length; i++){
          var option = document.createElement("option");
          var instName = JSON.stringify({ "schoolCode" : keys[i]["school"], "sessionCode": keys[i]["id"] });
          option.value = instName;
          option.text = keys[i]["schoolname"] + " - " + keys[i]["name"];
          if(keys[i]["schoolname"] != undefined && keys[i]["name"] != undefined && 
             keys[i]["school"]     != undefined && keys[i]["id"]   != undefined)
            dropdown.add(option);
          else{
            console.log(keys[i])
            console.log(keys[i]["schoolname"])
            console.log(keys[i]["name"])
            console.log(keys[i]["school"])
            console.log(keys[i]["id"])
          }
        }
      }
      else if(commandFromServer == "dept"){
          removeDropdowns(["dept"])
          //$("#ajax-loader").hide();
          var dropdown = document.getElementById('dept');
          var keys = Object.keys(data[1]);
          for(var i = keys.length - 1; i >= 0; i--){
              var option = document.createElement("option");
              var deptName = keys[i]
              option.text = deptName;
              option.value = data[1][deptName];
              if(deptName != undefined && data[1][deptName] != undefined) dropdown.add(option);
          }
      }
      else if(commandFromServer == "class_nbr"){ 
          //var table = document.getElementById("tableBody");
          //$("#tableBody").empty();
          //$("#ajax-loader").hide();
          var dept = $('#dept').val();
          data = data[1]
          //var nbrs = Object.keys(data);
          var t = $('#dataTables').DataTable();
          t.clear();
          for(var nbr in data){
              for(var section in data[nbr]){
                  var temp = data[nbr][section]
                  t.row.add([dept + ": " + nbr,section,temp['Instructor'],temp['Status'],temp['Days & Times'],temp['Room']])
              }
          }
          t.draw()


      }
      else if(commandFromServer == "classesWTopic"){
          data = data[1]
          for(var i = 1; i <= amountOfTabs; i++){
              var id = '#groupedTable' + i;
              var t = $(id).DataTable();
              t.clear();
              for(var theClass in data){
                  var theData = data[theClass];
                  var topic = theData["topic"]
                  if( topic == '' ){
                      topic = 'N/A or none'
                  }
                  t.row.add({
                      "Dept"         : theData["subject_name"].trim(),
                      "Class nbr"    : theData["subject_code"].trim() + " - " + theData["class_id"],
                      "Class Section": theData["class_num"],
                      "Teacher"      : theData["teacher"],
                      "Days And Time": theData["days_and_times"],
                      "Room"         : theData["room"],
                      "Topic"        : theData["topic"]
                  })
              }
              t.draw();
          }
      }
      else if(commandFromServer == "classes"){ 
          data = data[1]
          for(var i = 1; i <= amountOfTabs; i++){
            var id = '#groupedTable' + i
            var t = $(id).DataTable();
            t.clear();
            for(var theClass in data){
              var theData = data[theClass]
              t.row.add({
                        "Dept"         : theData["subject_name"].trim(),
                        "Class nbr"    : theData["subject_code"].trim() + " - " + theData["class_id"], 
                        "Class Section": theData["class_num"], 
                        "Teacher"      : theData["teacher"], 
                        "Days And Time": theData["days_and_times"],
                        "Room"         : theData["room"]
                      })
            }
            t.draw();
          }
      }
      else if(commandFromServer == "teacherInfo"){
        var table = $("#" + data[3]).dataTable().api();
        var row = table.row( data[2] );
        hiddenRowData[data[4]] = ["",data[1]]
        row.child( format(["",data[1]]) );
      }
      else if(commandFromServer == "statusInfo"){
        for(var i = 1; i <= amountOfTabs; i++){
          var id = "#groupedTable" + i
          var table = $(id).dataTable().api();
          var openClosed = data[4]
          if(data[4] == "CUNYFIRST may be down"){
            var matching = table.rows( function ( idx, data1, node ) { 
              var nbr = data1["Class nbr"];
              return nbr.substring(0,nbr.indexOf("-") - 1) == data[3] ? true : false;
            });
            matching.every( function () {
                changeStatus( this, "CUNYfirst may be down",id )
            });  
          }
          else{
            for (var j in openClosed){
              var matching = table.rows( function ( idx, data1, node ) { return data1["Class Section"] == j ? true : false;} );
              matching.every( function () {
                changeStatus( this, openClosed[j], id )
              } );
            }
          }
        }
      }
      else if(commandFromServer == "sendNotification"){
        alert(data[1]);
        showNotification(data[1],"http://icons.iconarchive.com/icons/icons8/android/256/Very-Basic-Checkmark-icon.png","/");
        location.reload()
      }
      else if(commandFromServer == "err" || commandFromServer == "Success"){
        alert(data[1]);
      }
      else if(commandFromServer == "test"){
        try{
          var start = new Date();
          var t = $('#dataTables').DataTable();
          t.rows.add(data[1]);
        } catch(err){
          console.log(err);
        }
        t.draw();
        var end = new Date();
        console.log( end.getTime() - start.getTime())
      }
      else if(commandFromServer == "topics"){
          topics = data[1].map( function(obj) { return obj.topic });
          // var table = $("#topicTable").DataTable();
          // table.clear();
          topics.forEach(function (topic) {
              if(topic.includes("Requirement Designation:") && !topic.includes("Regular Liberal Arts") &&
                  !topic.includes("Notes") && !topic.includes("Topic")){
                  $('#topicTable').append('<tr><td>'+topic+'</td></tr>');
                  // table.row.add({
                  //     "Topic" : topic
                  // })
              }
          });
          //table.draw();
      }
  } catch(err){
      console.log(err)
  }
};
ws.onopen = function(err){
  if(err) console.log(err);
  ws.send(JSON.stringify(["get_inst"]));
  // setTimeout( function() { ws.send(JSON.stringify(["getTestClasses"])) }, 500);
  setTimeout( function() { ws.send(JSON.stringify(["get_topics",'QNS01','1169'])) }, 500);
};

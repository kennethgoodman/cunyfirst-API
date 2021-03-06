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
        removeDropdowns(["inst"])
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
      else if(commandFromServer == "session"){
          removeDropdowns(["session","dept"])
          //$("#ajax-loader").hide();
          var dropdown = document.getElementById('session');
          for(var i = 1; i < data.length; i++){
              var option = document.createElement("option");
              var sessionName = Object.keys(data[i])[0];
              option.text = sessionName;
              option.value = data[i][sessionName];
              if(sessionName != undefined && data[i][sessionName] != undefined) dropdown.add(option);
          }
      }
      else if(commandFromServer == "classesForUser"){
        console.log(data)
        var makeTableHTML_ForAlreadySignedUp = function(myArray){
            var result = "You are already signed to be alerted for these classes: <br><br><table border=1>";
            result += "<thead><tr><th>Institution</th><th>Session</th><th>Department</th><th>Class Number</th><th>Class Section</th></tr><thead>";
            for(var i=0; i<myArray.length; i++) {
                //result += "<tr><td><input type='button' class=\"btn btn-danger removeUserClass\" value='Remove'></td>"
                result += "<tr><td>"+myArray[i]["inst"]+"</td>" + "<td>"+myArray[i]["session"]+"</td>" 
                          + "<td>"+myArray[i]["dept"]+"</td>" + "<td>"+myArray[i]["classnbr"]+"</td>" + "<td>"+myArray[i]["section"]+"</td></tr>";
            }
            if(myArray.length == 0){
              result += "<tr><td colspan=\"5\" style=\"text-align:center\">You are not signed up for any classes</td></td>"
            }
            result += "<tfoot><tr><th>Institution</th><th>Session</th><th>Department</th><th>Class Number</th><th>Class Section</th></tr><tfoot>";
            result += "</table>";

            return result;
        }
        var tableHTML = makeTableHTML_ForAlreadySignedUp(data.slice(1,data.length-1))
        $("#alreadySignedUpClasses").html( tableHTML )
        /*$(".removeUserClass").unbind('click').click(function(e){
            var result = confirm("Want to delete?");
            if (result) {
            var dataInRow = $(this).closest('tr').find("td");
            var removeQuery = ["removeUserClass"]
            var counter = 0
            $.each(dataInRow, function(){
                var theData = $(this).text()
                if(counter == 2)
                  theData = theData.substring(0, theData.indexOf(" -"))
                removeQuery.push(theData)
            })
            ws.send(JSON.stringify(removeQuery))
            $(this).closest('tr').remove()
            //Logic to delete the item
            }
        })
        console.log(data)*/
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
                  t.row.add([dept + ": " + nbr,section,data[nbr][section]['Instructor'],data[nbr][section]['Status'],data[nbr][section]['Days & Times'],data[nbr][section]['Room']])
              }
          }
          t.draw()
      }
      else if(commandFromServer == "classes"){ 
          //var table = document.getElementById("tableBody");
          //$("#tableBody").empty();
          data = data[1]
          //$("#ajax-loader").hide();
          //var nbrs = Object.keys(data);
          var t = $('#dataTables').DataTable();
          t.clear();
          for(var theClass in data){
            var theData = data[theClass]
            t.row.add({
                      "Dept"         : theData["subject_name"].trim(),
                      "Class nbr"    : theData["subject_code"].trim() + " - " + theData["class_id"], 
                      "Class Section": theData["class_num"], 
                      "Teacher"      : theData["teacher"], 
                      "Days And Time":theData["days_and_times"],
                      "Room"         : theData["room"]
                    })
          }
          t.draw();
      }
      else if(commandFromServer == "teacherInfo"){
        var table = $('#dataTables').dataTable().api();
        var row = table.row( data[2] )
        hiddenRowData[data[2]] = ["Loading...",data[1]]
        row.child( format(["Loading...this may take a minute",data[1]]) );
      }
      else if(commandFromServer == "statusInfo"){
        //console.log("got call statusInfo")
        var table = $('#dataTables').DataTable();
        var openClosed = data[4]
        if(data[4] == "CUNYFIRST may be down"){
          var matching = table.rows( function ( idx, data1, node ) { 
            var nbr = data1["Class nbr"]
            return nbr.substring(0,nbr.indexOf("-") - 1) == data[3] ? true : false;
          });
          //console.log(matching.data())
          matching.every( function () {
              changeStatus( table, this, "CUNYfirst may be down" )
          });  
        }
        for (i in openClosed){
          //console.log (i)
          var matching = table.rows( function ( idx, data1, node ) { return data1["Class Section"] == i ? true : false;} );
          //console.log(matching.data())
          matching.every( function () {
              changeStatus( table, this, openClosed[i] )
          } );  
        }
        //row.child( format( [ data[3][row.data()["Class Section"]],data[1] ] ) );
        
        //$("#ajax-loader").hide();
      }
      else if(commandFromServer == "classesBeingTaken"){
        data = data[1];
        var t = $('#tableForAlreadySignedUp').DataTable();
        t.clear();
        var textedString =""
        for(var classTaken in data){
          try{
            if(data[classTaken]["texted"] == true){
              textedString = "Yes"
            } else textedString = "No"
            t.row.add([data[classTaken]["inst"],data[classTaken]["session"],data[classTaken]["dept"],data[classTaken]["class"],data[classTaken]["section"],textedString])
          } catch(err){

          }  
        }
        
        t.draw()
      }
      else if(commandFromServer == "sendNotification"){
        showNotification(data[1],"http://icons.iconarchive.com/icons/icons8/android/256/Very-Basic-Checkmark-icon.png","/");
        location.reload()
      }
      else if(commandFromServer == "addClassToDT"){
        data = data[1];
        var textedString = "";
        try{
          var t = $('#tableForAlreadySignedUp').DataTable();
          if(data["texted"] == true){
            textedString = "Yes"
          } else textedString = "No"
          t.row.add([data["inst"],data["session"],data["dept"],data["class"],data["section"],textedString]);
        } catch(err){
          console.log(err);
        }
        t.draw();
      }
      else if(commandFromServer == "carriers"){
          var dropdown = document.getElementById('carrier');
          for(var i = 0; i < data[1].length; i++){
              var option = document.createElement("option");
              var carrier = data[1][i]
              option.text = carrier;
              option.value = carrier;
              if(carrier != undefined) dropdown.add(option);
          }
      }
      else if(commandFromServer == "err" || commandFromServer == "Success"){
        alert(data[1]);
      }
      else if(commandFromServer == "test"){
        console.log("in test")
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
  } catch(err){
      console.log(err)
  }
};
ws.onopen = function(err){
  if(err) console.log(err);

  //$("#ajax-loader").show();
  ws.send(JSON.stringify(["get_inst"]));
  ws.send(JSON.stringify(["getCarriers"]));
}

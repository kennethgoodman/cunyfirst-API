var host = location.origin.replace(/^http/, 'ws')
var ws = new WebSocket(host);
ws.onmessage = function (event) {
  var data = JSON.parse(event.data);
  try{
      var commandFromServer = data[0]
      if(commandFromServer == "keep open") return; //dont print, this is just a message to keep the websocket open

      if(commandFromServer == "inst"){
        removeDropdowns(["inst","session","dept"])
        $("#ajax-loader").hide();
        var keys = Object.keys(data[1]);
        var dropdown = document.getElementById('inst');
        for(var i = 0; i < keys.length; i++){
          var option = document.createElement("option");
          var instName = keys[i]
          option.value = instName;
          option.text = data[1][instName];
          if(instName != undefined && data[1][instName] != undefined)
            dropdown.add(option);
        }
      }
      else if(commandFromServer == "session"){
          removeDropdowns(["session","dept"])
          $("#ajax-loader").hide();
          var dropdown = document.getElementById('session');
          for(var i = 1; i < data.length; i++){
              var option = document.createElement("option");
              var sessionName = Object.keys(data[i])[0];
              option.text = sessionName;
              option.value = data[i][sessionName];
              if(sessionName != undefined && data[i][sessionName] != undefined) dropdown.add(option);
          }
      }
      else if(commandFromServer == "dept"){
          removeDropdowns(["dept"])
          $("#ajax-loader").hide();
          var dropdown = document.getElementById('dept');
          var keys = Object.keys(data[1]);
          for(var i = 0; i < keys.length; i++){
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
          $("#ajax-loader").hide();
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
        alert(data[1]);
        showNotification(data[1],"http://icons.iconarchive.com/icons/icons8/android/256/Very-Basic-Checkmark-icon.png","/account");
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
  } catch(err){
      console.log(err)
  }
};
ws.onopen = function(err){
  if(err) console.log(err);

  $("#ajax-loader").show();
  
  ws.send(JSON.stringify(["get_inst"]));
  ws.send(JSON.stringify(["getCarriers"]));
}

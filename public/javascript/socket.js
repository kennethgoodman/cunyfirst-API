var host = location.origin.replace(/^http/, 'ws')
var ws = new WebSocket(host);
ws.onmessage = function (event) {
  var data = JSON.parse(event.data);
  try{
      if(data[0] == "keep open") return; //dont print
      console.log(data);
      if(data[0] == "inst"){
          removeDropdowns(["inst","session","dept"])
          $("#ajax-loader").hide();
          var keys = Object.keys(data[1]);
          var dropdown = document.getElementById('inst');
          for(var i = 0; i < keys.length; i++){
              var option = document.createElement("option");
              var instName = keys[i]
              option.value = instName;
              option.text = data[1][instName];
              if(instName != undefined && data[1][instName] != undefined) dropdown.add(option);
          }
      }
      else if(data[0] == "session"){
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
      else if(data[0] == "dept"){
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
      else if(data[0] == "class_nbr"){ 
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
                  //console.log(data[nbr][section])
                  /*if(data[nbr][section]['Status'] != "Closed"){
                      continue;
                  }*/
                  t.row.add([dept + ": " + nbr,section,data[nbr][section]['Instructor'],data[nbr][section]['Status'],data[nbr][section]['Days & Times'],data[nbr][section]['Room']])
              }
          }
          t.draw()
          /*$('#dataTables tbody').on('click', 'tr', function (){
              if ( $(this).hasClass('selected') ) {
                 $(this).removeClass('selected');
              }
              else{
                  $(this).addClass('selected');
              }     
            });*/
      }
      else if(data[0] == "classesBeingTaken"){
        data = data[1];
        var t = $('#tableForAlreadySignedUp').DataTable();
        t.clear();
        for(var classTaken in data){
          try{
            t.row.add([data[classTaken]["inst"],data[classTaken]["session"],data[classTaken]["dept"],data[classTaken]["class"],data[classTaken]["section"],data[classTaken]["texted"]])
          } catch(err){

          }  
        }
        
        t.draw()
      }
      else if(data[0] == "sendNotification"){
        showNotification(data[1],"http://icons.iconarchive.com/icons/icons8/android/256/Very-Basic-Checkmark-icon.png","/account");
      }
      else if(data[0] == "addClassToDT"){
        data = data[1];
        try{
          var t = $('#tableForAlreadySignedUp').DataTable();
          t.row.add([data["inst"],data["session"],data["dept"],data["class"],data["section"],data["texted"]]);
        } catch(err){
          console.log(err);
        }
        t.draw();
      }
      else if(data[0] == "carriers"){
          var dropdown = document.getElementById('carrier');
          for(var i = 0; i < data[1].length; i++){
              var option = document.createElement("option");
              var carrier = data[1][i]
              option.text = carrier;
              option.value = carrier;
              if(carrier != undefined) dropdown.add(option);
          }
      }
      else if(data[0] == "err" || data[0] == "Success"){
        alert(data[1]);
      }
  } catch(err){
      console.log(err)
  }
};
ws.onopen = function(e){
  if(e) console.log(e);
  //console.log("Conn established")
  ws.send(JSON.stringify(["get_inst"]));
  $("#ajax-loader").show();
  ws.send(JSON.stringify(["getCarriers"]));
  $.get("/userData",function(data){
    if(data != ""){
      ws.send(JSON.stringify(["getCurrentClasses",data["username"]]))
    }
  }).fail(function(err) {
    console.log( "error" + err );
  });
  //ws.send(JSON.stringify(["test"]))
  var test = function(){
      ws.send(JSON.stringify(["get_session", "QNS01"]));
      ws.send(JSON.stringify(["get_dept","QNS01","1162"]));
      ws.send(JSON.stringify(["get_class","QNS01","1162","ACCT"]));
  }
  //test();
}
$(document).ready(function(){
  
});

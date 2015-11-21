var host = location.origin.replace(/^http/, 'ws')
var ws = new WebSocket(host);
ws.onmessage = function (event) {
  var data = JSON.parse(event.data);
  try{
      console.log(data);
      if(data[0] == "inst"){
          removeDropdowns(["inst","session","dept"])
          var keys = Object.keys(data[1]);
          for(var i = 0; i < keys.length; i++){
              var dropdown = document.getElementById('inst');
              var option = document.createElement("option");
              var instName = keys[i]
              option.value = instName;
              option.text = data[1][instName];
              if(instName != undefined && data[1][instName] != undefined) dropdown.add(option);
          }
      }
      else if(data[0] == "session"){
          removeDropdowns(["session","dept"])
          for(var i = 1; i < data.length; i++){
              var dropdown = document.getElementById('session');
              var option = document.createElement("option");
              var sessionName = Object.keys(data[i])[0];
              option.text = sessionName;
              option.value = data[i][sessionName];
              if(sessionName != undefined && data[i][sessionName] != undefined) dropdown.add(option);
          }
      }
      else if(data[0] == "dept"){
          removeDropdowns(["dept"])
          var keys = Object.keys(data[1]);
          for(var i = 0; i < keys.length; i++){
              var dropdown = document.getElementById('dept');
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
                  t.row.add([nbr,section,data[nbr][section]['Instructor'],data[nbr][section]['Status']])
              }
          }
          t.draw()
          $('#dataTables tbody').on('click', 'tr', function (){
              if ( $(this).hasClass('selected') ) {
                 $(this).removeClass('selected');
              }
              else{
                  $(this).addClass('selected');
              }     
            });
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
  } catch(err){
      console.log(err)
  }
};
setTimeout(function(){
  ws.send(JSON.stringify(["get_inst"]));
  ws.send(JSON.stringify(["getCarriers"]));
  test = function(){
      ws.send(JSON.stringify(["get_session", "QNS01"]));
      ws.send(JSON.stringify(["get_dept","QNS01","1162"]));
      ws.send(JSON.stringify(["get_class","QNS01","1162","ARAB"]));
  }
  //test();
},1250);
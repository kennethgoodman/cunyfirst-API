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
                  t.row.add([dept + ": " + nbr,section,data[nbr][section]['Instructor'],data[nbr][section]['Status'],data[nbr][section]['Days & Times'],data[nbr][section]['Room']])
              }
          }
          t.draw()


      }
      else if(commandFromServer == "classes"){ 
          data = data[1]
          var t = $('#dataTables').DataTable();
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
          var allRows = t.rows()[0]
          for(var i = 0; i < allRows.length; i++){
            var row = t.row( allRows[i] ).node();
            $(row).addClass("draggable_tr")
          }
          var table = $('#dataTables').DataTable()
          table.draw()

          $(table.rows().nodes()).draggable({ helper: function(){ 
                        var tr = $(this).closest('tr');
                        var row = table.row( tr );
                        var rowData = row.data()
                        return "<tr class='selectedRow'>\
                                <td>" + rowData["Class nbr"] + " - " + rowData["Class Section"] + "</td>\
                                <td>" + rowData["Teacher"] + "</td></tr>"
                        }, cursor: "move", revert: "invalid", cursorAt: { top: 5, left: 5 } });
          
          var addDroppable = function(id){
            var theGroupedTable = $(id).DataTable()
            $(id).droppable({
              drop: function (event, ui) {
                console.log(ui)
                var section = ui.helper[0].children[0].textContent
                var teacher = ui.helper[0].children[1].textContent
                console.log(rowsSecondDT)
                if(!rowsSecondDT[id][section]){
                  theGroupedTable.row.add({
                    "Class nbr"    : section,
                    "Teacher"      : teacher,
                  })
                  theGroupedTable.draw()
                  rowsSecondDT[id][section] = true
                }  
                $(theGroupedTable.rows().nodes()).draggable({ //TODO only this row
                  helper: function(){ 
                        var tr = $(this).closest('tr'); 
                        var row = theGroupedTable.row( tr );
                        var rowData = row.data()
                        var className = "'selectedRow " + row.index() + " " + id + "'"
                       return "<tr class=" + className            + ">\
                                <td>"      + rowData["Class nbr"] + "</td>\
                                <td>"      + rowData["Teacher"]   + "</td></tr>"
                        },
                  cursor: "move", revert: "invalid", cursorAt: { top: 5, left: 5 }
                }); 
              }
            });
          }
          for(var i = 1; i <= 6; i++){
            var id = "#groupedTable" + String(i)
            rowsSecondDT[id] = {}
            addDroppable(id) 
          }  
      }
      else if(commandFromServer == "teacherInfo"){
        var table = $('#dataTables').dataTable().api();
        var row = table.row( data[2] )
        hiddenRowData[data[2]] = ["Loading...",data[1]]
        row.child( format(["Loading...this may take a minute",data[1]]) );
      }
      else if(commandFromServer == "statusInfo"){
        var table = $('#dataTables').DataTable();
        var openClosed = data[4]
        if(data[4] == "CUNYFIRST may be down"){
          var matching = table.rows( function ( idx, data1, node ) { 
            var nbr = data1["Class nbr"]
            return nbr.substring(0,nbr.indexOf("-") - 1) == data[3] ? true : false;
          });
          matching.every( function () {
              changeStatus( this, "CUNYfirst may be down" )
          });  
        }
        for (i in openClosed){
          var matching = table.rows( function ( idx, data1, node ) { return data1["Class Section"] == i ? true : false;} );
          matching.every( function () {
              changeStatus( this, openClosed[i] )
          } );  
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
  ws.send(JSON.stringify(["get_inst"]));
}

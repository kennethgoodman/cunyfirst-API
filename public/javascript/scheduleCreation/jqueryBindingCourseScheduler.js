queryArray = []
function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}
function ValidateEmail(inputText)  
{  
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;  
    var element; //fix this
    if(inputText.match(mailformat))  {   
        return true;  
    }  
    else  {  
        alert("You have entered an invalid email address!");  
        return false;  
    }  
}  
function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}
function makeTableHTML(myArray,queryArray) {
    removeRow = function(e){
        delete queryArray[parseInt(e.id)]
        //removeFromArray(queryArray,parseInt(e.id)) //remove it from array and from UI
        $(e).closest('tr').remove()
        var count = 0
        for(var i in queryArray){
            if(queryArray[i] != null || queryArray != undefined)
                count++
        }
        if(count <= 5){
            $("#confirm").prop("disabled",true)
            $("#confirmInfo").append("<br>You must select a class before continuing")
        }
    }
    removeFromArray = function(array,from, to) {
        var rest = array.slice((to || from) + 1 || array.length);
        array.length = from < 0 ? array.length + from : from;
        return array.push.apply(array, rest);
    };
    var result = "<table border=1>";
    result += "<thead><tr><th>Delete</th><th>Institution</th><th>Department</th><th>Class Number</th><th>Class Section</th><th>Session ID</th><th>Class Times</th><th>Teacher</th><tr><thead>";
    for(var i=0; i<myArray.length; i++) {
        result += "<tr><td><input type='button' class=\"btn btn-danger\" value='Delete Row' id="+ (parseInt(i)+1) +" onclick='removeRow(this)'></td>"
        for(var j=0; j<myArray[i].length; j++){
            result += "<td>"+myArray[i][j]+"</td>";
        }
        result += "</tr>";
    }
    result += "</table>";

    return result;
}
$(document).ready(function(){
    if(queryArray != undefined)
        queryArray = queryArray
    $('table').on('click', 'input[type="button"]', function(e){
        $(this).closest('tr').remove()
    })
    $("#getSchedule").unbind('click').click( function (e) {
        $("#confirmDialog").modal("show")
        var dayMapping = {
            "Su" : "SUN",
            "Mo" : "MON",
            "Tu" : "TUE",
            "We" : "WED",
            "Th" : "THUR",
            "Fr" : "FRI",
            "Sa" : "SAT",
        }
        arrayOfarrays = [ [], [], [], [], [], [], [], [], [], [], [], [], [] ]
        var t = $('#groupTable').DataTable();
        t.clear();
        for(var i in schedulerStruct){
            var temp = schedulerStruct[i]
            var nbr = temp["Class nbr"]
            var classnbr = nbr.substr(nbr.indexOf("-")+2);
            var deptartment = nbr.substring(0,nbr.indexOf("-") - 1);
            var sectionNbr = temp["Class Section"]
            var daysTimes = temp['Days And Time']
            var times = daysTimes.substring(daysTimes.indexOf(" ") + 1)
            times = times.split(" - ")
            for(var i in times){
                console.log(times[i])
                var hourMin = times[i].split(":")
                var hour = parseInt(hourMin[0]) % 12
                var min = parseInt(hourMin[1].substring(0,hourMin[1].length - 2))
                if(hourMin[1].slice(-2) == "PM"){
                    hour += 12
                }
                times[i] = [hour, min]
            }
            var days = daysTimes.substring(0,daysTimes.indexOf(" "))
            days = days.match(new RegExp('.{1,2}', 'g'));
            for(var i in days){
                days[i] = dayMapping[days[i]]
            }
            if(days.length == 1){
                days = [days[0], days[0]]
            }
            if(times.length == 1){
                times = [times[0],times[0]]
            }
            var teacherName = temp['Teacher']
            console.log(teacherName)
            var tempCunyClass = new CunyClass(dept=deptartment, number=classnbr, daysOfWeek=days, 
                                              section = new Section(
                                                            new Class_Time(
                                                                    new Time(times[0][0],times[0][1]),
                                                                    new Time(times[1][0],times[1][1])),
                                                                sectionNbr,
                                               ),
                                              teacher = teacherName
                                )
            arrayOfarrays[temp["group"]].push(tempCunyClass)
            t.row.add({
                  "Dept"         : deptartment.trim(),
                  "Class nbr"    : classnbr, 
                  "Class Section": sectionNbr, 
                  "Teacher"      : teacherName, 
                  "Days And Time": daysTimes,
                  "Group"        : temp["group"]
                })
        }
        t.draw();
        $("#getScheduleConfirm").unbind('click').click( function (e) {
            var numberOfClasses = $("#groupCountId").val()
            if(numberOfClasses.indexOf("-") != -1){
                numberOfClasses = numberOfClasses.split("-")
                numberOfClasses[0] = numberOfClasses[0].trim()
                numberOfClasses[1] = numberOfClasses[1].trim()
                if(numberOfClasses[0] > numberOfClasses[1]){
                    numberOfClasses = [numberOfClasses[1], numberOfClasses[0]]
                }
            }
            var listOfClasses = []
            for(var i in arrayOfarrays){
                if(arrayOfarrays[i].length > 0){
                    listOfClasses.push(arrayOfarrays[i])
                }
            }
            b = balancer(listOfClasses,numberOfClasses)
            console.log("Printing Top Schedules")
            console.log(b)
        })
    });
    $('#inst').unbind('change').change(function(){
        //$("#ajax-loader").show();
        var e = document.getElementById("inst");
        values = JSON.parse(e.options[e.selectedIndex].value)
        //console.log(values)
        ws.send(JSON.stringify(["get_classes",values["schoolCode"], values["sessionCode"]]));
        //send message for get session
    })
    $('body').on('input', '.groupInput',function(){
        $this = $(this)
        var table = $('#dataTables').DataTable();
        var tr = $this.closest('tr')
        var row = table.row( tr );
        var rowData = row.data()
        var key = rowData["Class Section"]
        var group = $this.val()
        if(key in schedulerStruct){
          delete schedulerStruct[key] // delete it and re-add it
        }
        
        if (($this.val() < 1 || $this.val() > 12) && $this.val().length != 0){
          if ($this.val() < 1) {
              group = 1
          }
          else if ($this.val() > 12) {
              group = 12
          }
        }
        rowData["group"] = group
        schedulerStruct[key] = rowData
    })
    $('body').on('focus', '.groupInput',function(){
      $(this).on('mousewheel.disableScroll', function (e) {
        e.preventDefault()
      })
      var table = $('#dataTables').DataTable();
      var $this = $(this)

      interval = setInterval(
          function () {
              if (($this.val() < 1 || $this.val() > 12) && $this.val().length != 0) {
                  if ($this.val() < 1) {
                      $this.val(1)
                  }
                  else if ($this.val() > 12) {
                      $this.val(12)
                  }

                  $('#fadingMessage').fadeIn(1000, function () {
                    $(this).fadeOut(500)
                  })
              }
          }, 50)
    })
    $('input').on('blur', 'input[type=number]', function (e) {
        $(this).off('mousewheel.disableScroll')
    })
    $('body').on('blur', '.groupInput',function(e){
      if (interval != false) {
        window.clearInterval(interval)
        interval = false;
      }
    })
});

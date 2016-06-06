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
function parseDaysAndTimes(daysTimes){
    var dayMapping = {
            "Su" : "SUN",
            "o" : "MON", //since we split on M, so no 'M's
            "Tu" : "TUE",
            "We" : "WED",
            "Th" : "THUR",
            "Fr" : "FRI",
            "Sa" : "SAT",
        }
    var timesSplit = daysTimes.split("M")
    var timesArray = []
    var days = []
    var daysPerTime = 0 //how many days we have for the start/end time
    for(var i = 0; i < timesSplit.length; i++){
        var item = timesSplit[i].trim()
        if(item == "")
            continue
        else{
            /******** Get Days ****/
            daysPerTime = 0
            var theDays = item.trim()
            var theDays = theDays.substring(0,theDays.indexOf(" "))
            var indexOfMon = theDays.indexOf("o") //if it is -1, it will never show up in loop
            var spot = Math.floor(indexOfMon/2)
            var theDays = theDays.replace("o", "")
            var theDaysSplit = theDays.match(new RegExp('.{1,2}', 'g'))
            if(theDaysSplit == null || theDaysSplit.length == 0){
                days.push(dayMapping["o"])
                daysPerTime++ 
            }
            for(var j in theDaysSplit){
                if(j == spot){ //if we are up to the spot that monday should be pushed, add monday
                    days.push(dayMapping["o"]) 
                    daysPerTime++;
                }
                days.push(dayMapping[theDaysSplit[j]])
                daysPerTime++;
            }
            /******** Get Days ****/

            /******** Get Times ****/
            var item = item.substring(item.indexOf(" "))
            var times = [item.replace("-", "").trim(), timesSplit[++i].replace("-", "").trim()] 
            for(var h in times){
                var hourMin = times[h].split(":")
                var hour = parseInt(hourMin[0]) % 12
                var min = parseInt(hourMin[1].substring(0,hourMin[1].length - 1))
                if(hourMin[1].slice(-1) == "P"){
                    hour += 12
                }
                times[h] = [hour, min]
            }
            for(var k = 0; k < daysPerTime; k++){//push it for each day,
                timesArray.push(times[0]) //start
                timesArray.push(times[1]) //end
            }
            /******** Get Times ****/
        }
    }
    return [days, timesArray]
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
            var tempDaysAndTimes = parseDaysAndTimes(daysTimes)
            var days = tempDaysAndTimes[0]
            var times = tempDaysAndTimes[1]
            var teacherName = temp['Teacher']
            var theClassTimes = []
            var daysCounter = 0
            for(var i = 0 ; i < times.length; i += 2){
                theClassTimes.push( new Class_Time( new Time(times[i][0],times[i][1]), new Time(times[i+1][0],times[i+1][1]), days[daysCounter++] ))
            }
            var classSection = new Section( theClassTimes, sectionNbr );
            var tempCunyClass = new CunyClass(dept       = deptartment, 
                                              number     = classnbr, 
                                              daysOfWeek = days, 
                                              section    = classSection,
                                              teacher    = teacherName
                                             );
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
            $("#confirmDialog").modal("toggle")
            $("#userPreferencesDialog").modal("show")
            $("#backButton").unbind('click').click(function(){
                    $("#userPreferencesDialog").modal("toggle")
                    $("#confirmDialog").modal("show")
            })
            $("#preferencesConfirm").unbind('click').click(function(){
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
    $(function() {
        var sliderItem = $( "#DaysInSchoolslider-range" )
        var textItem = $( "#DaysInSchool" )
        sliderItem.slider({
            range: true,
            min: 1,
            max: 7,
            values: [ 3, 4 ],
            slide: function( event, ui ) {
                textItem.val( ui.values[ 0 ] + " - " + ui.values[ 1 ] + " Days");
            }
        });
        textItem.val( sliderItem.slider( "values", 0 ) + " - " + sliderItem.slider( "values", 1 ) + " Days" );
    });
    $("#slider-range").slider({
        range: true,
        min: 360,
        max: 1410,
        step: 15,
        values: [600, 960],
        slide: function (e, ui) {
            var hours1 = Math.floor(ui.values[0] / 60);
            var minutes1 = ui.values[0] - (hours1 * 60);

            if (hours1.length == 1) hours1 = '0' + hours1;
            if (minutes1.length == 1) minutes1 = '0' + minutes1;
            if (minutes1 == 0) minutes1 = '00';
            if (hours1 >= 12) {
                if (hours1 == 12) {
                    hours1 = hours1;
                    minutes1 = minutes1 + " PM";
                } else {
                    hours1 = hours1 - 12;
                    minutes1 = minutes1 + " PM";
                }
            } else {
                hours1 = hours1;
                minutes1 = minutes1 + " AM";
            }
            if (hours1 == 0) {
                hours1 = 12;
                minutes1 = minutes1;
            }



            $('.slider-time').html(hours1 + ':' + minutes1);

            var hours2 = Math.floor(ui.values[1] / 60);
            var minutes2 = ui.values[1] - (hours2 * 60);

            if (hours2.length == 1) hours2 = '0' + hours2;
            if (minutes2.length == 1) minutes2 = '0' + minutes2;
            if (minutes2 == 0) minutes2 = '00';
            if (hours2 >= 12) {
                if (hours2 == 12) {
                    hours2 = hours2;
                    minutes2 = minutes2 + " PM";
                } else if (hours2 == 24) {
                    hours2 = 11;
                    minutes2 = "59 PM";
                } else {
                    hours2 = hours2 - 12;
                    minutes2 = minutes2 + " PM";
                }
            } else {
                hours2 = hours2;
                minutes2 = minutes2 + " AM";
            }

            $('.slider-time2').html(hours2 + ':' + minutes2);
        }
    });
    $(document).on("click", "tr", function () {
        $(this).toggleClass("selectedRow");
    });
    $('#trash').droppable({
        drop: function(event, ui) {
            var classes = ui.helper.attr('class').split(" ")
            var rowNum = classes[1]
            var tableId = classes[2]
            var temp_table = $(tableId).DataTable()
            var row = temp_table.row(rowNum)
            var section = row.data()["Class nbr"]
            row.remove()
            temp_table.draw()
            rowsSecondDT[tableId][section] = false
            $(".groupedTable .dataTables_empty").text("Drag and drop classes from the main table above");
            ui.draggable.remove(); 
        }
    });
});

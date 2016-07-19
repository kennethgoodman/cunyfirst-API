queryArray = []
schedules = []
checkedSchedules = []
currentIndex = 0
function getTeacherScore(teacherName){
    return undefined
}
function getTeacherScores(){
    $('.row-selected').each(function(index){
        console.log(this)
        console.log($(this).children()[4])
    })
}
var setAllChildrenWithDepartment = function (department, id){
    var table = $('#' + id).DataTable();
    var matching = table.rows( function ( idx, data, node ) {return data["Dept"] === department ?true : false;} );
    matching.every( function () {
        table.cell(this, 7).data("checking CUNYFirst")
    } );  
}
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
function add_event_handler(current_idx){
    var table = $("#groupedTable" + current_idx).DataTable();
    $("#groupedTable" + current_idx + " tbody").on('click', 'td.details-contro', function () { //open/closed
        var tr = $(this).closest('tr');
        var row = table.row( tr );
        console.log(row)
        var department = row.data()['Dept']
        if (detCounter[department] != undefined ) return;
        else{
            detCounter[department]= "a string"
            var rowData = row.data()
            var e = document.getElementById("inst");
            values = JSON.parse(e.options[e.selectedIndex].value)
            var inst = values["schoolCode"]
            var session = values["sessionCode"]  
            var dataToSend = ["updateStatus",inst, session, rowData["Class nbr"].substring(0,rowData["Class nbr"].indexOf("-") - 1),
                              rowData["Class nbr"].substr(rowData["Class nbr"].indexOf("-") + 2),rowData["Class Section"], row.index(), rowData["Teacher"]]        
            ws.send(JSON.stringify(dataToSend))

            for(var i = 1; i <= amountOfTabs; i++)
                setAllChildrenWithDepartment(department, "groupedTable" + i)
        }
    })  
    $("#groupedTable" + current_idx + " tbody").on('click', 'td.details-control', function () { 
        var tableId = $(this).closest('tr').closest('table').attr('id');
        var tr = $(this).closest('tr');
        var row = table.row( tr );
        var rowData = row.data()
        var e = document.getElementById("inst");
        values = JSON.parse(e.options[e.selectedIndex].value)
        var inst = values["schoolCode"]
        var session = values["sessionCode"]  
        var teacher = rowData["Teacher"]

        var dataToSend = ["getRMP", inst, teacher, row.index(), tableId ]      
        if ( row.child.isShown() ) { // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else if(hiddenRowData[teacher] != undefined){
            row.child( format(hiddenRowData[teacher]) ).show()
           tr.addClass('shown');
        }
        else{
            row.child(blank).show()
            tr.addClass('shown');
            ws.send(JSON.stringify(dataToSend))
            rowsLookedAt[row.index()] = true
        }
    }); 
}
function add_Data_To_DataTable(current_idx){
    var rowsData = $("#groupedTable" + 1).DataTable().rows().data()
    var rowsDataLength = rowsData.length
    var table = $("#groupedTable" + current_idx).DataTable();
    for(var rowIndex = 0; rowIndex < rowsDataLength; rowIndex++ ){
        var tableObject = rowsData[rowIndex]
        table.rows.add([ tableObject ])
        if(rowIndex >= rowsDataLength - 1)
            break
    }
    table.draw()
    add_event_handler(current_idx)
}
function initDataTable(current_idx){
    $("#groupedTable" + current_idx).DataTable({
        dom: "ftip",
        select: {
            style: "multi",
            className: 'row-selected selected'
        },
        "columns": [
            {
                "className":      'details-control',
                "orderable":      false,
                "data":           '',
                "defaultContent": '<button type=\"button\" class=\"btn btn-info\"><span class=\"glyphicon glyphicon-info-sign\"></span> Info</button>'
            },
            { "data" : "Dept"},
            { "data" : "Class nbr" },
            { "data" : "Class Section" },
            { "data" : "Teacher" },
            { "data" : "Days And Time" },
            { "data" : "Room" },
            {
                data: 'Status',
                className: "details-contro",
                defaultContent: '<button type=\"button\" class=\"btn\"> update </button>'
            },
        ],
        "order": [[2, 'asc']],
        responsive: true,
        fixedHeader: true,
        "deferRender": true, 
        searching: true,
    });
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
function fillSchedule(schedule){
    $("#calendar").fullCalendar( 'removeEvents' ); // reset calender
    var dayMapping = {
        "SUN" : "Sunday",
        "MON" : "Monday",
        "TUE" : "Tuesday",
        "WED" : "Wednesday",
        "THUR" : "Thursday",
        "FRI" : "Friday",
        "SAT" : "Saturday"
    }
    for( var theClass in schedule.listOfClasses){
        var temp = schedule.listOfClasses[theClass]
        var section = temp.section                     
        var number = section.number
        var classTime = section.class_time[0]
        var start = classTime.startTime
        var end = classTime.endTime
        for(var d in temp.daysOfWeek){
            var day = dayMapping[ temp.daysOfWeek[d] ]
            $('#calendar').fullCalendar( 'addEventSource', [ { 
                title: temp.dept + "-" + temp.number + ": " + section.number + "\n" + temp.teacher,
                start: moment().day(day).hour(start.hour).minute(start.minute),
                end: moment().day(day).hour(end.hour).minute(end.minute),
                allDay: false }
                ] 
            )
        }
    }
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
function breaksHardScore(schedule){
    var fridayMorning = $("#fridayMorning").is(":checked") // before 3pm
    var fridayNight = $("#fridayNight").is(":checked") //after 3pm
    var saturday = $("#saturday").is(":checked")
    var sunday = $("#sunday").is(":checked")
    var startTime = parseTime($('.slider-time').html().trim())
    var endTime = parseTime($('.slider-time2').html().trim())
    var minDays = $(".slider-schoolRange").html().trim()
    var maxDays = $(".slider-schoolRange2").html().trim()
    for(var theClassIndex in schedule.listOfClasses){
        var theClass = schedule.listOfClasses[theClassIndex]
        if(theClass.daysOfWeek.length < minDays || theClass.daysOfWeek.length > maxDays ){
            return true
        }
            
        for(var d in theClass.daysOfWeek){
            var day = theClass.daysOfWeek[d]
            if((day == "SAT" && !saturday) || (day == "SUN" && !sunday)){
                console.log("failed for being on sat/sun")
                console.log((day == "SAT" && !saturday))
                console.log((day == "SUN" && !sunday))
                return true
            }
        }
        for(var classTime in theClass.section.class_time){
            var theClassTime = theClass.section.class_time[classTime]
            if(!startTime.lessThenOrEqual(theClassTime.startTime) || !theClassTime.endTime.lessThenOrEqual(endTime)){
                return true
            }
        }
    }
    return false
}
function parseTime(stringTime){
    var PM = stringTime.slice(-2) == "PM"
    var stringTime = stringTime.substring(0, stringTime.length - 2)
    stringTime = stringTime.split(":");
    hour = parseInt(stringTime[0])
    hour += PM && hour != 12 ? 12 : 0;
    return new Time(hour, parseInt(stringTime[1]))
}
function setupSchedules(){
    $("#calendar").fullCalendar( 'removeEvents' ); // reset calender
    checkedSchedules = []
    for(var s in schedules){
        var schedule = schedules[s]
        if(!breaksHardScore(schedule)){
            checkedSchedules.push(schedule)
        }
    }
    currentIndex = 0; // reset index
    $(".leftScheduleButton").prop("disabled",true);
    len = checkedSchedules.length
    if(len >= 1){
        fillSchedule(checkedSchedules[0])
        if(len == 1)
            $(".rightScheduleButton").prop("disabled",true);
        else
            $(".rightScheduleButton").prop("disabled",false);
    }
    else { // no schedules
        $(".rightScheduleButton").prop("disabled",true);
        $('#calendar').fullCalendar( 'addEventSource', [ { 
            title: "No Schedules, Please redo a search or change the parameters",
            start: moment().day("Sunday").hour(0).minute(0),
            end: moment().day("Saturday").hour(23).minute(59),
            allDay: true }
            ] 
        )
    }
}
$(document).ready(function(){
    $('#calendar').fullCalendar({
        header: {
            left: '',
            right: ''
        },
        defaultView: 'agendaWeek',
        editable: false,
        columnFormat: 'dddd',
        aspectRatio: 1.72,
        minTime: "07:00:00",
        maxTime: "23:30:00",
    });
    $('#calendar').fullCalendar( 'addEventSource', [ { 
        title: "No Schedules, Please pick classes and do a search",
        start: moment().day("Sunday").hour(0).minute(0),
        end: moment().day("Saturday").hour(23).minute(59),
        allDay: true }
        ] 
    )
    $(".leftScheduleButton").prop("disabled",true);
    $(".rightScheduleButton").prop("disabled",true);
    $(".leftScheduleButton").unbind('click').click(function(){
        currentIndex -= 1;
        fillSchedule(checkedSchedules[currentIndex])
        $(".rightScheduleButton").prop("disabled",false);
        if(currentIndex == 0)
           $(".leftScheduleButton").prop("disabled",true);
    })
    $(".rightScheduleButton").unbind('click').click(function(){
        currentIndex = currentIndex + 1;
        fillSchedule(checkedSchedules[currentIndex])
        $(".leftScheduleButton").prop("disabled",false);
        if(currentIndex >= checkedSchedules.length - 1)
           $(".rightScheduleButton").prop("disabled",true);
    })
    if(queryArray != undefined)
        queryArray = queryArray
    $('table').on('click', 'input[type="button"]', function(e){
        $(this).closest('tr').remove()
    })
    $("#getSchedule").unbind('click').click( function (e) {
        //getTeacherScores()
        $("#confirmDialog").modal("show")
        arrayOfarrays = [  ];
        for(var z = 0; z <= amountOfTabs+1; z++)
            arrayOfarrays = arrayOfarrays.concat([[]])
        var t = $('#groupTable').DataTable();
        t.clear();
        for(var k = 1; k <= amountOfTabs; k++){
            var table = $("#groupedTable" + k).DataTable()
            var rows = table.rows('.row-selected')
            for(var j in rows[0]){
                var temp = table.row(rows[0][j]).data()
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
                var teacherScore = getTeacherScore(teacherName)
                var classSection = new Section( theClassTimes, sectionNbr );
                var tempCunyClass = new CunyClass(dept         = deptartment, 
                                                  number       = classnbr, 
                                                  daysOfWeek   = days, 
                                                  section      = classSection,
                                                  teacher      = teacherName,
                                                  teacherScore = teacherScore
                                                 );
                arrayOfarrays[k].push(tempCunyClass)
                t.row.add({
                      "Dept"         : deptartment.trim(),
                      "Class nbr"    : classnbr, 
                      "Class Section": sectionNbr, 
                      "Teacher"      : teacherName, 
                      "Days And Time": daysTimes,
                      "Group"        : k
                    })

            }
            t.draw()
        }
        $("#getScheduleConfirm").unbind('click').click( function (e) {
            $("#confirmDialog").modal("toggle")
            schedules = []
            var listOfClasses = []
            for(var i in arrayOfarrays){
                if(arrayOfarrays[i].length > 0){
                    listOfClasses.push(arrayOfarrays[i])
                }
            }
            var numberOfClasses = $("#groupCountId").val()
            if(numberOfClasses > amountOfTabs)
                alert("Can't take more classes than the number of classes you have chosen from")
            if(numberOfClasses.indexOf("-") != -1){ // it is there
                numberOfClasses = numberOfClasses.split("-")
                numberOfClasses[0] = numberOfClasses[0].trim()
                numberOfClasses[1] = numberOfClasses[1].trim()
                if(numberOfClasses[0] > numberOfClasses[1]){
                    numberOfClasses = [numberOfClasses[1], numberOfClasses[0]]
                }
                for(var i = numberOfClasses[0]; i <= numberOfClasses[1]; i++)
                    schedules = schedules.concat(balancer(listOfClasses,i))
            }
            else{
                schedules = balancer(listOfClasses,numberOfClasses)
            }
            setupSchedules()
        })
    });
    $("#GetResultsSchedule").unbind('click').click(function(){
        setupSchedules()
    })
    $('#inst').unbind('change').change(function(){
        //$("#ajax-loader").show();
        var e = document.getElementById("inst");
        values = JSON.parse(e.options[e.selectedIndex].value)
        //console.log(values)
        ws.send(JSON.stringify(["get_classes",values["schoolCode"], values["sessionCode"]]));
        //send message for get session
    })
    $(function() {
        var sliderItem = $( "#DaysInSchoolslider-range" )
        var textItem = $( "#DaysInSchool" )
        sliderItem.slider({
            range: true,
            min: 1,
            max: 7,
            values: [ 2, 4 ],
            slide: function( event, ui ) {
                textItem.val( ui.values[ 0 ] + " - " + ui.values[ 1 ] + " Days");
                $('.slider-schoolRange').html(ui.values[ 0 ])
                $('.slider-schoolRange2').html(ui.values[ 1 ])
            }
        });
        textItem.val( sliderItem.slider( "values", 0 ) + " - " + sliderItem.slider( "values", 1 ) + " Days" );
    });
    $(function() {
        var sliderItem = $( "#maxBreakTimeSlider-range-min" )
        var textItem = $( "#maxBreakTimeSlider" )
        sliderItem.slider({
            range: "min",
            min: 0,
            max: 36*60,
            step: 30,
            value:  6*60,
            slide: function( event, ui ) {
                var hours1 = Math.floor(ui.value / 60);
                var minutes1 = ui.value - (hours1 * 60);
                if (hours1.length == 1) hours1 = '0' + hours1;
                if (minutes1.length == 1) minutes1 = '0' + minutes1;
                $('.slider-maxBreakTime').html(hours1 +  " hours and " + minutes1 + " minutes");
            }
        });
        textItem.val( sliderItem.slider( "values", 0 ) + " - " + sliderItem.slider( "values", 1 ) + " Days" );
    });
    $("#slider-range").slider({
        range: true,
        min: 360,
        max: 1410,
        step: 15,
        values: [570, 1050], //930AM -> 530p
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
    $(document).ready(function() {
        $('#addTab').click( function(e){
            e.preventDefault();
            var current_idx = $("#TabsId").find("li").length - 1;
            $(this).closest('li').before("<li><a data-toggle='tab' href='#menu" + current_idx + "'>Class Option " + current_idx + "</a></li>" )
            var tableStr = "<div id='menu" + current_idx + "' class='tab-pane fade'> \
                                <table id='groupedTable" + current_idx + "' class='bitacoratable groupedTable' cellspacing='0'>\
                                    <thead>\
                                        <tr>\
                                            <th>Rate My Professor</th><th>Dept</th>\
                                            <th>Class nbr</th><th>Class Section</th><th>Teacher</th> \
                                            <th>Days and Time</th><th>Room</th><th>Status</th> \
                                        </tr> \
                                    </thead> \
                                    <tfoot> \
                                        <tr> \
                                            <th>Rate My Professor</th><th>Dept</th> \
                                            <th>Class nbr</th><th>Class Section</th><th>Teacher</th> \
                                            <th>Days and Time</th><th>Room</th><th>Status</th> \
                                        </tr> \
                                    </tfoot> \
                                </table> \
                            </div>"
            $(".tab-content").append(tableStr)
            initDataTable(current_idx)
            add_Data_To_DataTable(current_idx)
            amountOfTabs += 1
        });
    });
});

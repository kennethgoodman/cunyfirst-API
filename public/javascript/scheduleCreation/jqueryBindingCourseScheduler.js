queryArray = []
GLOBALschedules = []
checkedSchedules = []
currentIndex = 0
compareColors = []
maxNumberToCompare = 6
CompareSchedulesIndex = {}
function rainbow(numOfSteps, step) {
    // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
    // Adam Cole, 2011-Sept-14
    // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    var r, g, b;
    var h = step / numOfSteps;
    var i = ~~(h * 6);
    var f = h * 6 - i;
    var q = 1 - f;
    switch(i % 6){
        case 0: r = 1; g = f; b = 0; break;
        case 1: r = q; g = 1; b = 0; break;
        case 2: r = 0; g = 1; b = f; break;
        case 3: r = 0; g = q; b = 1; break;
        case 4: r = f; g = 0; b = 1; break;
        case 5: r = 1; g = 0; b = q; break;
    }
    var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
    return (c);
}
function setUpCompareColors(len){
    compareColors = []
    for(var i = 0; i < len; i++)
        compareColors.push(rainbow(len, i))
}
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
        table.cell(this, 8).data("checking CUNYFirst")
    } );  
}
function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
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
        "lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
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
function addAllDayEvent(cal,theClass,section, color){
    cal.fullCalendar( 'addEventSource', [ { 
        title: theClass.dept + "-" + theClass.number + ": " + section.number + "\n" + theClass.teacher + "\nNo time Info",
        start: moment().day("Sunday").hour(0).minute(0),
        end: moment().day("Saturday").hour(23).minute(59),
        allDay: true,
        color : color,
        }
        ] 
    )
}
function addClassToCal(cal,theClass,section, start, end, color){
    var dayMapping = {
        "SUN" : "Sunday",
        "MON" : "Monday",
        "TUE" : "Tuesday",
        "WED" : "Wednesday",
        "THUR" : "Thursday",
        "FRI" : "Friday",
        "SAT" : "Saturday"
    }
    for(var d in theClass.daysOfWeek){
        var day = dayMapping[ theClass.daysOfWeek[d] ]
        cal.fullCalendar( 'addEventSource', [ { 
            title: theClass.dept + "-" + theClass.number + ": " + section.number + "\n" + theClass.teacher,
            start: moment().day(day).hour(start.hour).minute(start.minute),
            end: moment().day(day).hour(end.hour).minute(end.minute),
            allDay: false,
            color : color,
             }
            ] 
        )
    }
}
function putScheduleUp(str){
    var HTMLstr = 
                        '</tbody>' +
                    '</table>' +
                '</div>'
    $("#SchedulesToCompare").html(str + HTMLstr)
}
function HtmlForRow(theClass,section, id){
    var HTMLstr = '<tr>' +
                                '<th scope="row">' + id + '</th>' +
                                '<td>' + theClass.dept + '</td>' +
                                '<td>' + theClass.number + '</td>' +
                                '<td>' + section.number + '</td>' +
                                '<td>' + theClass.teacher + '</td>' +
                            '</tr>'
    return HTMLstr
}
function startSchedulesTable(deleteOldOnes, id){
    var htmlString = '<div style="background-color:' + compareColors[id] + '">' +
                            '<div class="checkbox">'+
                                '<label>'+
                                    '<input type="checkbox" class="compareSchedulesCheckbox" id=compareSchedulesCheckbox' + id + '> Compare this schedule'+
                                '</label>' +
                            '</div>' + 
                            '<table class="table table-bordered theScheduleTable">' +
                                '<thead>' +
                                    '<tr>' +
                                        '<th>#</th>' +
                                        '<th>dept</th>' +
                                        '<th>number</th>' +
                                        '<th>section</th>' +
                                        '<th>teacher</th>' +
                                    '</tr>' +
                                '</thead>' +
                                '<tbody>'
    if(!deleteOldOnes)
        htmlString = $("#SchedulesToCompare").html() + htmlString
    return htmlString
}
function addEventHandlerToCheckbox(){
    $(".compareSchedulesCheckbox").on('click', function(){
        var theId = $(this).attr("id")
        var checked = $("#" + theId).is(":checked")
        var theIndex = theId.replace("compareSchedulesCheckbox","")
        if(checked)
            CompareSchedulesIndex[ theIndex ] = true;
        else
            CompareSchedulesIndex[ theIndex ] = false;
    })
}
function checkCheckboxes(){
    for(var index in CompareSchedulesIndex){
        if(CompareSchedulesIndex[index]){
            $("#compareSchedulesCheckbox" + index).attr('checked', true);
        }
    }
}
function fillSchedule(schedule, removeAll, index ){
    var color = compareColors[index]
    var cal = $('#calendar');
    if( removeAll ) cal.fullCalendar( 'removeEvents' ); // reset calender
    var htmlForSchedulesTable = startSchedulesTable(removeAll, index)
    for( var theClass in schedule.listOfClasses){
        var temp = schedule.listOfClasses[theClass]
        var section = temp.section                     
        var number = section.number
        var classTime = section.class_time[0]
        var start = classTime.startTime
        var end = classTime.endTime
        htmlForSchedulesTable += HtmlForRow(temp, section, parseInt(theClass)+1)
        if(start.hour == null || start.minute == null || end.hour == null || end.minute == null)
            addAllDayEvent(cal,temp,section, color)
        else
            addClassToCal(cal, temp, section, start, end, color)  
    }
    putScheduleUp(htmlForSchedulesTable)
    checkCheckboxes()
    $("#scheduleNumber").html(currentIndex+1)
    addEventHandlerToCheckbox()
}
function fillInComparedSchedules(){
    for(var index in CompareSchedulesIndex){
        if(CompareSchedulesIndex[index]){
            fillSchedule(checkedSchedules[index],false, index)
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
function breaksTeacherRule(teacher){
    return false
}
function getSliderTimes(){
    startTimes = []
    endTimes = []
    for(var i = 0; i < 7; i++){
        startTimes.push(parseTime($('#slider-time1' + i).html().trim()))
        endTimes.push(parseTime($('#slider-time2' + i).html().trim()))
    }
    return [startTimes, endTimes]
}
function getMaxBreakTime(){
    var temp = $('.slider-maxBreakTime').html()
    var hourOfBreaks = parseInt(temp.substring(0,temp.indexOf("hour")).trim())
    var minOfBreaks = parseInt(temp.substring(temp.indexOf("min")-3,temp.indexOf("min")).trim())
    return new Time(hourOfBreaks, minOfBreaks)
}
function breaksHardScoreByDay(schedule, startTimes, endTimes, maxBreakTime){
    // set up mapping
    var dayMapping = {
        "SUN" : 0,
        "MON" : 1,
        "TUE" : 2,
        "WED" : 3,
        "THUR" : 4,
        "FRI" : 5,
        "SAT" : 6
    }
    // do checks
    schedule = new ClassesByDay(schedule.getListOfClasses())
    for(var i = 0; i < 7; i++){
        if(schedule.listOfClasses[i].length() == 0) continue 
        // else
        // check maxBreakTime
        schedule.sortThis(i)
        var last = schedule.listOfClasses[i].listOfCunyClasses[0]; // this is the first class of the day
        var firstClassTime = last.section.class_time[0]
        for(var j = 1; j < schedule.listOfClasses[i].listOfCunyClasses.length; j++){ //starting from the second class of the day
            var theClass = schedule.listOfClasses[i].listOfCunyClasses[j]
            var theClassTime = theClass.section.class_time[0]
            if(theClassTime.startTime == null || theClassTime.endTime == null) continue
            
            var breakTime = Time.subtraction(theClassTime.startTime,last.section.class_time[0].endTime)
            if(breakTime.greaterThan(maxBreakTime))
                return true
            last = theClass
        }   
        // check that first and last class follow timings
        var lastClassTime = last.section.class_time[0]
        var startTime = startTimes[dayMapping[lastClassTime.day]]
        var endTime = endTimes[dayMapping[lastClassTime.day]]
        if( firstClassTime.startTime == null || lastClassTime.endTime == null || lastClassTime.day == null) continue
        if( firstClassTime.startTime.lessThan(startTime) || lastClassTime.endTime.greaterThan(endTime)) return true
    }
    for(var i in schedule.listOfClasses[7]){
        if(breaksTeacherRule(teacher)) // if RMP about null day
            return true
    }
    return false
}
function addUiCloseTabsEventHandler(){
    $(".ui-icon-close").on('click', function(){
        var li = $(this).closest("li").parent()
        $($(this).closest("li").children("a").attr("href")).remove()
        $(this).closest("li").remove()
        amountOfTabs -= 1
        var children = li.children()
        for(var i = 1; i < children.length - 1; i++){
            var tempText = $(children[i]).children("a").text()
            $(children[i]).children("a").html(tempText.replace(/[0-9]/g, i))
        }
    })
}
function breaksHardScore(schedule, startTimes, endTimes, maxBreakTime){
    var dayMapping = {
        "SUN" : 0,
        "MON" : 1,
        "TUE" : 2,
        "WED" : 3,
        "THUR" : 4,
        "FRI" : 5,
        "SAT" : 6
    }
    for(var theClassIndex in schedule.listOfClasses){
        var theClass = schedule.listOfClasses[theClassIndex]
        if(breaksTeacherRule(theClass.teacher))
            return true
        for(var classTime in theClass.section.class_time){
            var theClassTime = theClass.section.class_time[classTime]
            var startTime = startTimes[dayMapping[theClassTime.day]]
            var endTime = endTimes[dayMapping[theClassTime.day]]
            if(theClassTime.startTime == null || theClassTime.endTime == null || theClassTime.day == null) continue
            if(!startTime.lessThanOrEqual(theClassTime.startTime) || !theClassTime.endTime.lessThanOrEqual(endTime)) return true
        }
    }
    for(var i in schedule.listOfClasses[7]){
        // if RMP about null day
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
    for(var s in GLOBALschedules){
        var schedule = GLOBALschedules[s]
        sliderTimes = getSliderTimes()
        maxBreakTimeSlider = getMaxBreakTime()
        // console.log(breaksHardScore(schedule, sliderTimes[0],sliderTimes[1]) === breaksHardScoreByDay(schedule, sliderTimes[0],sliderTimes[1], maxBreakTimeSlider))
        if(!breaksHardScoreByDay(schedule, sliderTimes[0],sliderTimes[1], maxBreakTimeSlider)){
            checkedSchedules.push(schedule)
        }
    }
    
    currentIndex = 0; // reset index
    $(".leftScheduleButton").prop("disabled",true);
    len = checkedSchedules.length
    setUpCompareColors(len)
    $("#numberOfSchedules").html(len)
    if(len >= 1){
        fillSchedule(checkedSchedules[0],true, 0)
        if(len == 1)
            $(".rightScheduleButton").prop("disabled",true);
        else
            $(".rightScheduleButton").prop("disabled",false);
    }
    else { // no schedules
        $(".rightScheduleButton").prop("disabled",true);
        $('#calendar').fullCalendar( 'addEventSource', [ { 
            title: "No Schedules, Please redo a search or change the parameters ( min/max days in school, min/max classes)",
            start: moment().day("Sunday").hour(0).minute(0),
            end: moment().day("Saturday").hour(23).minute(59),
            allDay: true }
            ] 
        )
        $('#scheduleNumber').html('0')
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
        allDay: true }])
    $(".leftScheduleButton").prop("disabled",true);
    $(".rightScheduleButton").prop("disabled",true);
    $(".leftScheduleButton").unbind('click').click(function(){
        currentIndex -= 1;
        fillSchedule(checkedSchedules[currentIndex],true, currentIndex)
        fillInComparedSchedules()
        $(".rightScheduleButton").prop("disabled",false);
        if(currentIndex == 0)
           $(".leftScheduleButton").prop("disabled",true);
    })
    $(".rightScheduleButton").unbind('click').click(function(){
        currentIndex = currentIndex + 1;
        fillSchedule(checkedSchedules[currentIndex],true, currentIndex)
        fillInComparedSchedules()
        $(".leftScheduleButton").prop("disabled",false);
        if(currentIndex >= checkedSchedules.length - 1)
           $(".rightScheduleButton").prop("disabled",true);
    })
    if(queryArray != undefined)
        queryArray = queryArray
    $('table').on('click', 'input[type="button"]', function(e){
        $(this).closest('tr').remove()
    })
    $("#GetResultsSchedule").unbind('click').click( function (e) {
        //getTeacherScores()
        //$("#confirmDialog").modal("show")
        arrayOfarrays = [  ];
        for(var z = 0; z <= amountOfTabs+1; z++)
            arrayOfarrays = arrayOfarrays.concat([[]])
        //var t = $('#groupTable').DataTable();
        //t.clear();
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
                if(daysTimes.trim() == "TBA")
                    tempDaysAndTimes = [[null],[[null,null],[null,null]]]
                else
                    tempDaysAndTimes = parseDaysAndTimes(daysTimes)
                var days = tempDaysAndTimes[0]
                var times = tempDaysAndTimes[1]
                var teacherName = temp['Teacher']
                var theClassTimes = []
                var daysCounter = 0
                for(var i = 0 ; i < times.length; i += 2){
                    theClassTimes.push( new Class_Time( new Time(times[i][0],times[i][1]), 
                                                        new Time(times[i+1][0],times[i+1][1]), 
                                                        days[daysCounter++] 
                                                    ))
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
                /*t.row.add({
                      "Dept"         : deptartment.trim(),
                      "Class nbr"    : classnbr, 
                      "Class Section": sectionNbr, 
                      "Teacher"      : teacherName, 
                      "Days And Time": daysTimes,
                      "Group"        : k
                    })
                */
            }
            //t.draw()
        }
        //$("#getScheduleConfirm").unbind('click').click( function (e) {
        //    $("#confirmDialog").modal("toggle")
        GLOBALschedules = []
        var listOfClasses = []
        for(var i in arrayOfarrays){
            if(arrayOfarrays[i].length > 0){
                listOfClasses.push(arrayOfarrays[i])
            }
        }
        var maxClasses = $("#maxNumClasses").val()
        for(var i = $("#minNumClasses").val(); i <= maxClasses; i++) {
            var newTempSchedules = []
            try {
                newTempSchedules = balancer(listOfClasses, i)
            } catch (err) {
                console.log(err)
                // TODO: what to do on error
            }
            if(newTempSchedules.length) {
                GLOBALschedules = GLOBALschedules.concat(newTempSchedules)
            }
        }
        setupSchedules()
    });
    $('#inst').unbind('change').change(function(){
        var e = document.getElementById("inst");
        values = JSON.parse(e.options[e.selectedIndex].value)
        ws.send(JSON.stringify(["get_classes_w_topic",values["schoolCode"], values["sessionCode"]])); // get classes
        ws.send(JSON.stringify(["get_topics",values["schoolCode"], values["sessionCode"]])); // get topics
        $('.currentlyTakingFromGroup').DataTable().clear().draw(); // empty side table
        $(".currentlyTakingFromGroup .dataTables_empty").text("Start selecting classes for them to show up here");
    });
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
            min: 15,
            max: 14*60,
            step: 15,
            value:  2*60,
            slide: function( event, ui ) {
                var hours1 = Math.floor(ui.value / 60);
                var minutes1 = ui.value - (hours1 * 60);
                if (hours1.length == 1) hours1 = '0' + hours1;
                if (minutes1.length == 1) minutes1 = '0' + minutes1;
                $('.slider-maxBreakTime').html(hours1 +  " hours and " + minutes1 + " minutes");
            }
        });
    });
    sliderFunction = function(theId,theClassOne,theClassTwo){
        $(theId).slider({
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
                $(theClassOne).html(hours1 + ':' + minutes1);

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
                $(theClassTwo).html(hours2 + ':' + minutes2);
            }
        });
    }
    sliderFunction("#slider-range",'.slider-time1','.slider-time2')
    for(var i = 0; i < 7; i++)
        sliderFunction("#slider-range" + i,'#slider-time1' + i,'#slider-time2' + i)
    /*$(document).on("click", "tr", function () {
        $(this).toggleClass("selectedRow");
    });*/
    $(document).ready(function() {
        $('#addTab').click( function(e){
            e.preventDefault();
            var current_idx = $("#TabsId").find("li").length - 1;
            $(this).closest('li').before("<li><a data-toggle='tab' href='#menu" + current_idx + "'>Class Group " + current_idx + "</a><span class='ui-icon ui-icon-close' role='presentation'></li>" )
            var tableStr = "<div id='menu" + current_idx + "' class='tab-pane fade'> \
                                <p> You want <input type='number' name='quantity' min='1' max='5' style='width:40px' value='1' id='NumberOfClassesFromGroup" + current_idx + "'> \
                                classes from this group (You will only get one class for each Department-Class combo)</p> \
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
            addUiCloseTabsEventHandler()
        });
    });
    addUiCloseTabsEventHandler();
    $('#minNumClasses').change(function () {
        minVal = $('#minNumClasses').val();
        maxVal = $('#maxNumClasses').val();
        if(  minVal > maxVal ){
            $('#maxNumClasses').val(minVal)
        }
    });
    $('#maxNumClasses').change(function () {
        minVal = $('#minNumClasses').val();
        maxVal = $('#maxNumClasses').val();
        if(  maxVal < minVal ){
            $('#minNumClasses').val(maxVal)
        }
    });
    $("#topicTable").on('click', 'td', function () {
        var topicClicked = this.innerHTML;
        var table = $('.groupedTable').DataTable();
        table.search( topicClicked.replace("Requirement Designation: ","").replace("&amp;","&") ).draw();
    });
});

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
    $("#submitData").unbind('click').click( function (e) {
        $("#confirm").prop("disabled",false);//just in case the button is disabled
        clicked(function(queryArray,infoArray){
            $("#infoDialog").modal("show")
            $("#next").unbind('click').click(function(){
                var carrier = $('#carrier').val();
                var phoneNbr = $('#you_phone_nbr').val();
                phoneNbr = parsePhoneNumber(phoneNbr);
                ws.send(JSON.stringify(["getClassesForUser",phoneNbr, carrier]))

                for(var e in queryArray){
                    if(queryArray[e] == null || queryArray[e] == undefined)
                        removeFromArray(queryArray,parseInt(e))
                }
                var contactHow = "text";
                queryArray.push(phoneNbr)
                queryArray.push(carrier)
                queryArray.push("NA")
                queryArray.push(contactHow)
                //console.log(queryArray)
                var whatWillHappen = "you have chosen to be alerted as soon as these classes open: <br><br>"
                whatWillHappen += makeTableHTML(infoArray,queryArray)//.slice(0, -1))
                $("#confirmInfo").html( whatWillHappen )
                if(queryArray.length <= 5){
                    $("#confirm").prop("disabled",true)
                    $("#confirmInfo").append("<br>You must select a class before continuing")
                }
                $("#infoDialog").modal("toggle")
                $("#confirmDialog").modal("show")
                $("#backButton").unbind('click').click(function(){
                    $("#confirmDialog").modal("toggle")
                    $("#infoDialog").modal("show")
                })
            })
            $("#confirm").unbind('click').click(function (){
                $("#confirmDialog").modal("toggle")
                queryArray = replaceAll(JSON.stringify(queryArray), "null,", "") //remove all the deleted items
                if(queryArray.length > 5) ws.send(queryArray) //there are five default information parameters
            })
        });
    });
    $('#inst').unbind('change').change(function(){
        //$("#ajax-loader").show();
        var e = document.getElementById("inst");
        values = JSON.parse(e.options[e.selectedIndex].value)
        //console.log(values)
        ws.send(JSON.stringify(["get_classes",values["schoolCode"], values["sessionCode"]]));
        //send message for get session
    })
    $('#session').unbind('change').change(function(){
        //$("#ajax-loader").show();
        var e = document.getElementById("inst");
        var f = document.getElementById("session");
        ws.send(JSON.stringify(["get_dept",e.options[e.selectedIndex].value,
                                           f.options[f.selectedIndex].value]));
        //send message for get dept
    })
    $('#dept').unbind('change').change(function(){
        //$("#ajax-loader").show();
        var e = document.getElementById("inst");
        var f = document.getElementById("session");
        var g = document.getElementById("dept");
        ws.send(JSON.stringify(["get_class",e.options[e.selectedIndex].value,
                                            f.options[f.selectedIndex].value,
                                            g.options[g.selectedIndex].value]));
        //send message for get class
    })
});
removeDropdowns = function(dropdowns){
    for(var select in dropdowns){
        var id = "#" + dropdowns[select];
        var starting = "Pick a";
        if(dropdowns[select] == "inst")
            starting += "n institution";
        else if(dropdowns[select] == "session")
            starting += " session";
        else
            starting += " department";
        $(id)
                .find('option')
                .remove()
                .end()
                .append('<option value="starting">'+starting+'</option>')
            ;
    }
}
function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}
parsePhoneNumber = function(nbr){
    if(nbr.indexOf("-") != 0){
        nbr = replaceAll(nbr,"-","")
    }
    if(nbr.indexOf("+") != 0){
        nbr = nbr.replace("+","");
    }
    if(nbr.length > 10 && nbr[0] == '1'){
        nbr = nbr.substring(1);
    }
    return nbr;
}
validEmailAndPhoneNbr = function(phoneNbr,email){
    if(email == "" && phoneNbr == ""){
        alert("Enter your phone number or email please")
        return false;
    }
    if(phoneNbr.length != 10){
        alert("That phone number was not a 10 digit phone number, 9171234567 is the correct way to enter it.");
        return false;
    }
    else if(carrier == "defualt"){
        alert("please enter a carrier")
        return false;
    }
    if(contactHow == "email" || contactHow == "both"){
        if(!ValidateEmail(email) || email == ""){
            alert("please enter a valid email address")
            return false;
        }
    }
    if(email.length > 50){
        alert("That email is too long, only emails less than 50 characters")
        return false
    }
    if(email == "" || contactHow == "text")
        email = "N/A";
    if(phoneNbr == "" || contactHow == "email"){
        phoneNbr = "N/A";
    }
    return [phoneNbr,email]
}
clicked = function(callback){
    var inst, session;
    try{
        var e = document.getElementById("inst");
        values = JSON.parse(e.options[e.selectedIndex].value)
        var inst = values["schoolCode"]
        var session = values["sessionCode"]
    } catch(ignored){

    }

    if(inst == "defualt"){
        alert("Please enter an institution")
        return;
    } else if(session == "defualt"){
        alert("Please enter a session")
        return;
    }
    var shouldDeleted = true
    var infoArray = []
    var queryArray = ["submit"];
    var count = 0;
    var nbr;
    var section;
    var dept;

    queryArray = ["submit"]
    var table = $('#dataTables').DataTable();
    table.rows('.selected').data().each(function(){
        var temp = $(this)[count++] //get tr

        nbr = temp["Class nbr"]
        classnbr = nbr.substr(nbr.indexOf("-")+2);
        dept = nbr.substring(0,nbr.indexOf("-") - 1);
        section = temp["Class Section"]
        daysTimes = temp['Days And Time']
        teacher = temp['Teacher']
        try{
            queryArray.push([inst,dept,classnbr,section,session]);
            infoArray.push([inst,dept,classnbr,section,session,daysTimes,teacher])

        } catch(err){
            console.log(err)
        }
        //console.log("info arrayy")
        //console.log(infoArray)
    })
    //infoArray.push([phoneNbr, email])
    //if(count > 0) ws.send(JSON.stringify(queryArray)); //now implemented later
    //if( count < 1 ){alert("Please select a class"); return;}   
    //console.log(queryArray)
    callback(queryArray,infoArray)      
}

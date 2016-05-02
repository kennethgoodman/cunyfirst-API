queryArray = []
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
removeFromArray = function(array,from, to) {
  var rest = array.slice((to || from) + 1 || array.length);
  array.length = from < 0 ? array.length + from : from;
  return array.push.apply(array, rest);
};
function makeTableHTML(myArray) {
    console.log(myArray)
    var result = "<table border=1>";
    for(var i=0; i<myArray.length; i++) {
        result += "<tr>";
        result += "<td><input type='button' value='Delete Row' id="+ i +" onclick='removeRow(this)'></td>"
        for(var j=0; j<myArray[i].length; j++){
            result += "<td>"+myArray[i][j]+"</td>";
        }
        result += "</tr>";
    }
    result += "</table>";

    return result;
}
$(document).ready(function(){
    removeRow = function(e){
        removeFromArray(queryArray,parseInt(e.id))
        $(e).closest('tr').remove()
    }
    $('table').on('click', 'input[type="button"]', function(e){
        console.log("in buton")
        $(this).closest('tr').remove()
    })
    $("#submitData").unbind('click').click( function (e) {
        clicked(function(queryArray, count, infoArray){
            $("#confirmDialog").modal("show")
            var whatWillHappen= "you will get a text/email as soon as these classes open: <br>"
            whatWillHappen += makeTableHTML(infoArray.slice(0, -1))
            whatWillHappen += "<br> We will alert " + JSON.stringify(infoArray[infoArray.length-1])
            $("#confirmInfo").html( whatWillHappen )
            $("#confirm").unbind('click').click(function (){
                //if(count>0) ws.send(JSON.stringify(queryArray))
                console.log(queryArray)
                $("#confirmDialog").modal("toggle")
            })
        });
    });
    $('#inst').unbind('change').change(function(){
        $("#ajax-loader").show();
        var e = document.getElementById("inst");
        values = JSON.parse(e.options[e.selectedIndex].value)
        console.log(values)
        ws.send(JSON.stringify(["get_classes",values["schoolCode"], values["sessionCode"]]));
        //send message for get session
    })
    $('#session').unbind('change').change(function(){
        $("#ajax-loader").show();
        var e = document.getElementById("inst");
        var f = document.getElementById("session");
        ws.send(JSON.stringify(["get_dept",e.options[e.selectedIndex].value,
                                           f.options[f.selectedIndex].value]));
        //send message for get dept
    })
    $('#dept').unbind('change').change(function(){
        $("#ajax-loader").show();
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
validEmailAndPhoneNbr = function(phoneNbr,email, contactHow){
    return ["1516","k@y"]
    if(email == "" && phoneNbr == ""){
        alert("Enter your phone number or email please")
        return false;
    }
    if(contactHow == "text" || contactHow == "both"){
        if(phoneNbr.length != 10){
            alert("That phone number was not a 10 digit phone number, 9171234567 is the correct way to enter it.");
            return false;
        }
        else if(carrier == "defualt"){
            alert("please enter a carrier")
            return false;
        }
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
    var contactHow = $(".example input[type='radio']:checked").val();
    var fullName
    var userName
    var phoneNbr = $('#you_phone_nbr').val();
    phoneNbr = parsePhoneNumber(phoneNbr);
    var email = $('#emailInput').val();
    var valid = validEmailAndPhoneNbr(phoneNbr,email,contactHow);
    if(valid){
        phoneNbr = valid[0]
        email = valid[1]
    } else{ 
        return //not a valid email or/and phone number
    } 
    
    var contactInfo
    if(contactHow == "text" || contactHow == "both"){
        contactInfo = phoneNbr
    }
    else if(contactHow == "email"){
        contactInfo == email
    }
    fullName = contactInfo
    userName = contactInfo
    var e = $("#inst");
    values = JSON.parse(e.val())
    if(values == "starting")
        return

    var inst = values["schoolCode"]
    var session = values["sessionCode"]

    var carrier = $('#carrier').val();
    var shouldDeleted = true
    var infoArray = []

    var count = 0;
    var nbr;
    var section;
    var dept;

    queryArray = ["submit"];
    var table = $('#dataTables').DataTable();
    table.rows('.selected').data().each(function(){
        count++;
        var temp = $(this)[0] //get tr
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
    })
    queryArray.push(phoneNbr)
    queryArray.push(carrier)
    queryArray.push(email)
    queryArray.push(contactHow)
    infoArray.push([phoneNbr, email])
    console.log(queryArray)
    console.log(infoArray)

    //if(count > 0) ws.send(JSON.stringify(queryArray)); //now implemented later
    if(count<1){alert("Please select a class"); return;}   
    callback(queryArray, count, infoArray)      
}

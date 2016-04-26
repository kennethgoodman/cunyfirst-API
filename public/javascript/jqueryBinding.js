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
$(document).ready(function(){
    $("#submitData").unbind('click').click( function (e) {
        clicked();
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
    if(email == "" || contactHow == "text")
        email = "N/A";
    if(phoneNbr == "" || contactHow == "email"){
        phoneNbr = "N/A";
    }
    return [phoneNbr,email]
}
clicked = function(){
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
        alert("Not a valid email or phoneNumber") //not a valid email or/and phone number
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
    var e = document.getElementById("inst");
    values = JSON.parse(e.options[e.selectedIndex].value)
    var carrier = $('#carrier').val();
    var inst = values["schoolCode"]
    var session = values["sessionCode"]
    

    if(inst == "defualt"){
        alert("Please enter an institution")
        return;
    } else if(session == "defualt"){
        alert("Please enter a session")
        return;
    }
    var shouldDeleted = true
    var queryArray = ["submit"];
    var count = 0;
    var nbr;
    var section;
    var dept;
    $( ".row-selected" ).each(function(){
        count++;
        var temp = $(this)[0] //get tr
        nbr = temp.childNodes[0].textContent.trim();
        classnbr = nbr.substr(nbr.indexOf("-")+2);
        dept = nbr.substring(0,nbr.indexOf("-") - 1);
        section = temp.childNodes[1].textContent.trim();
        try{
            queryArray.push([fullName,inst,dept,classnbr,section,phoneNbr,session,userName,carrier,shouldDeleted]);
        } catch(err){
            console.log(err)
        }
    })
    queryArray.push(email)
    queryArray.push(contactHow)
    console.log(queryArray)
    if(count > 0) ws.send(JSON.stringify(queryArray));
    else          alert("Please select a class");
}

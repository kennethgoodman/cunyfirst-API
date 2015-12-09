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

userData = [];
loggedIn = false;
$.get("/userData",function(data){
    userData = data;
    if(userData == ""){
        loggedIn = false;
        $(document).ready(function(){
            })
        //$("#submitData").disabled = true;
        /*$("#submitData").attr('disabled', true);
        $("#buttonToDeleteClasses").attr('disabled', true);*/
    }
    else{
        loggedIn = true;
    }
}).fail(function(e) {
    console.log( "error" + e );
  });
$(document).ready(function(){
    $('.editbtn').click(function(){
        $(this).html($(this).html() == '<span class="glyphicon glyphicon-pencil" style="margin-right:5px"></span>edit data' ? '<span class="glyphicon glyphicon-ok" style="margin-right:5px"></span>Submit changes' : '<span class="glyphicon glyphicon-pencil" style="margin-right:5px"></span>edit data');
        var td = $("." + this.id);
        td.attr("contenteditable", ! $.parseJSON($("." + this.id).attr("contenteditable")));
        td.toggleClass("editable");
        if($(this).text() == 'edit data'){ //just clicked submit
            $.get("/userData",function(data){
                ws.send(JSON.stringify(["changePhoneNumber",[data.username,userData["fullName"].trim(),td.text(),"N/A",userData["email"]]]))
            })
        }
    });
    $("#submitData").unbind('click').click( function (e) {
        console
        $.get("/userData",function(data){
            if(data != "") clicked();
        }).fail(function(err) {
            console.log( "error" + err );
          });;
        
    });
    $('#inst').unbind('change').change(function(){
        $("#ajax-loader").show();
        var e = document.getElementById("inst");
        ws.send(JSON.stringify(["get_session",e.options[e.selectedIndex].value]));
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
clicked = function(){
    var contactHow = $(".example input[type='radio']:checked").val();
    console.log(contactHow)
    var fullName = userData["fullName"].trim();
    var userName = userData["username"].trim();
    var inst = $('#inst').val();
    var session = $('#session').val();
    var dept = $('#dept').val();
    var phoneNbr = $('#you_phone_nbr').val();
    phoneNbr = parsePhoneNumber(phoneNbr);
    var carrier = $('#carrier').val();
    var nbr;
    var section;
    var email = $('#emailInput').val();
    if(email == "" && phoneNbr == ""){
        alert("Enter your phone number please")
        return;
    }
    if(contactHow == "text" || contactHow == "both"){
        if(phoneNbr.length != 10){
            alert("That phone number was not a 10 digit phone number, 9171234567 is the correct way to enter it.");
            return;
        }
        else if(carrier == "defualt"){
            alert("please enter a carrier")
            return;
        }
    }
    if(contactHow == "email" || contactHow == "both"){
        if(!ValidateEmail(email)){
            return;
        }
        if(email == ""){
            alert("please enter a valid email address")
            return;
        }
    }
    if(email == "" || contactHow == "text")
        email = "N/A";
    if(phoneNbr == "" || contactHow == "email"){
        phoneNbr = "N/A";
    }

    if(inst == "defualt"){
        alert("Please enter an institution")
        return;
    } else if(session == "defualt"){
        alert("Please enter a session")
        return;
    } else if(dept == "defualt"){
        alert("Please enter a department")
        return;
    } 
    var shouldDeleted = $("#deltedWhenTexted").prop('checked');
    var queryArray = ["submit"];
    var count = 0;
    
    $( ".row-selected" ).each(function(){
        count++;
        var temp = $(this)[0] //get tr
        nbr = temp.childNodes[0].textContent.trim();
        nbr = nbr.substr(nbr.indexOf(":")+2);
        section = temp.childNodes[1].textContent.trim();
        try{
            queryArray.push([fullName,inst,dept,nbr,section,phoneNbr,session,userName,carrier,shouldDeleted]);
        } catch(err){
            console.log(err)
        }
    })
    queryArray.push(email)
    queryArray.push(contactHow)
    if(count > 0) ws.send(JSON.stringify(queryArray));
    else          alert("Please select a class");
}

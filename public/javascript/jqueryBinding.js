$(document).ready(function(){
    $('.editbtn').click(function(){
        $(this).html($(this).html() == 'edit data ' ? 'submit changes' : 'edit data ');
        var td = $("." + this.id);
        $("." + this.id).attr("contenteditable", ! $.parseJSON($("." + this.id).attr("contenteditable")));
        
    });
    $("#submitData").unbind('click').click( function (e) {
        clicked()
    });
    $('#inst').unbind('change').change(function(){
        var e = document.getElementById("inst");
        ws.send(JSON.stringify(["get_session",e.options[e.selectedIndex].value]));
        //send message for get session
    })
    $('#session').unbind('change').change(function(){
        var e = document.getElementById("inst");
        var f = document.getElementById("session");
        ws.send(JSON.stringify(["get_dept",e.options[e.selectedIndex].value,
                                           f.options[f.selectedIndex].value]));
        //send message for get dept
    })
    $('#dept').unbind('change').change(function(){
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
        $(id)
                .find('option')
                .remove()
                .end()
                .append('<option value="defualt">pick one</option>')
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
    return nbr;
}
clicked = function(){
    var fullName = $('.fullName')[0].textContent.trim();
    var userName = $('.username')[0].textContent.trim();
    var inst = $('#inst').val();
    var session = $('#session').val();
    var dept = $('#dept').val();
    var phoneNbr = $('#you_phone_nbr').val();
    phoneNbr = parsePhoneNumber(phoneNbr);
    var nbr;
    var section;
    if(phoneNbr.length < 10){
        alert("please enter a valid phone number");
        return;
    }
    var carrier = $('#carrier').val();
    if(carrier == "defualt"){
        alert("please enter a carrier")
        return;
    }
    $( ".selected" ).each(function(){
        var temp = $(this)[0] //get tr
        nbr = temp.childNodes[0].textContent.trim();
        section = temp.childNodes[1].textContent.trim();
        try{
            ws.send(JSON.stringify(["submit",fullName,inst,dept,nbr,section,phoneNbr,session,userName, carrier]));
        } catch(err){
            console.log(err)
        }
    })
}
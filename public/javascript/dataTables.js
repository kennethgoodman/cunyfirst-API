rowsLookedAt = {}
var blank = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
        '<tr>'+
            '<td> Status: </td>'+
            '<td>'+'waiting'+'</td>'+
        '</tr>'+
        '<tr>'+
            '<tr>'+
            '<td> Waiting </td>'+
            '<td> If it stays like this, then refresh the page </td>'+
        '</tr>'+ 
        '</tr>'+       
    '</table>';
function format ( data ) {
    if(data[1] == "No Data" || data[1] == undefined)
        return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
        '<tr>'+
            '<td> Status: </td>'+
            '<td>'+data[0]+'</td>'+
        '</tr>'+
        '<tr>'+
            '<td> No Teacher Information </td>'+
            '<td> If This is a mistake please help <br>others and let support know</td>'+
        '</tr>'+       
    '</table>';
    // `d` is the original data object for the row
    return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
        '<tr>'+
            '<td> Status: </td>'+
            '<td>'+data[0]+'</td>'+
        '</tr>'+
        '<tr>'+
            '<td> Average Grade: </td>'+
            '<td>'+data[1]["avggrade"] +'</td>'+
        '</tr>'+       
        '<tr>'+
            '<td> Chili: </td>'+
            '<td>'+data[1]["chili"] +'</td>'+
        '</tr>'+
        '<tr>'+
            '<td> Easyness: </td>'+
            '<td>'+data[1]["easyness"] +'</td>'+
        '</tr>'+
        '<tr>'+
            '<td> Helpfulness: </td>'+
            '<td>'+data[1]["helpfulness"] +'</td>'+
        '</tr>'+
        '<tr>'+
            '<td> Quality: </td>'+
            '<td>'+data[1]["quality"] +'</td>'+
        '</tr>'+
        '<tr>'+
            '<td> Url: </td>'+
            '<td><a href='+ data[1]["url"] + ' target=\"_blank\">go and see reviews here</a></td>'+
        '</tr>'+
    '</table>';
}
$(document).ready(function() {
    var table = $('#dataTables').DataTable({
    	select: {
    		style: "multi",
    		className: 'row-selected selected'
    	},
        "columns": [
            {
                "className":      'details-control',
                "orderable":      false,
                "data":           null,
                "defaultContent": ''
            },
            { "data" : "Dept"},
            { "data" : "Class nbr" },
            { "data" : "Class Section" },
            { "data" : "Teacher" },
            { "data" : "Days And Time" },
            { "data" : "Room" }
        ],
        "order": [[2, 'asc']],
    	responsive: true,
    	fixedHeader: true,
    	"deferRender": true, 
        searching: true
    });
    $("#dataTables .dataTables_empty").text("Please choose your institution and session");   
    $('#dataTables tbody').on('click', 'tr', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );
        var rowData = row.data()

        var e = document.getElementById("inst");
        values = JSON.parse(e.options[e.selectedIndex].value)
        var inst = values["schoolCode"]
        var session = values["sessionCode"]  
        var dataToSend = ["getTheClassInfo",inst, session, rowData["Class nbr"].substring(0,rowData["Class nbr"].indexOf("-") - 1),
                          rowData["Class nbr"].substr(rowData["Class nbr"].indexOf("-") + 2),rowData["Class Section"], row.index(), rowData["Teacher"]]        
        if ( row.child.isShown() ) {
                // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
            return
        }
        else if(hiddenRowData[row.index()] != undefined){
            row.child( format(hiddenRowData[row.index()]) ).show()
            tr.addClass('shown');
        }
        else{
            row.child(blank).show()
            $("#ajax-loader").show();
            tr.addClass('shown');
            ws.send(JSON.stringify(dataToSend))
            rowsLookedAt[row.index()] = true   
        }
    }); 
});
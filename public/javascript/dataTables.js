function format ( status ) {
    // `d` is the original data object for the row
    return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
        '<tr>'+
            '<td> Status: </td>'+
            '<td>'+status+'</td>'+
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
            { "data" : "Class nbr" },
            { "data" : "Class Section" },
            { "data" : "Teacher" },
            { "data" : "Days And Time" },
            { "data" : "Room" }
        ],
        "order": [[1, 'asc']],
    	responsive: true,
    	fixedHeader: true,
    	"deferRender": true
    });
    $("#dataTables .dataTables_empty").text("Please choose your institution andsession");   
    $('#dataTables tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );
        var rowData = row.data()

        var e = document.getElementById("inst");
        values = JSON.parse(e.options[e.selectedIndex].value)
        var inst = values["schoolCode"]
        var session = values["sessionCode"]  
        var dataToSend = ["getTheClassInfo",inst, session, rowData["Class nbr"].substring(0,rowData["Class nbr"].indexOf("-") - 1),
                          rowData["Class nbr"].substr(rowData["Class nbr"].indexOf("-") + 2),rowData["Class Section"], row.index()]
        console.log(dataToSend)
        
        if ( row.child.isShown() ) {
                // This row is already open - close it
                row.child.hide();
                tr.removeClass('shown');
            }
        else {
            // Open this row
            $("#ajax-loader").show();
            ws.send(JSON.stringify(dataToSend))
            tr.addClass('shown');
        }
    } ); 
});


detCounter = {}
hiddenRowData = {}
rowsLookedAt = {}
var setAllChildrenWithDepartment = function (department, id){
    var table = $('#' + id).DataTable();
    var matching = table.rows( function ( idx, data, node ) {return data["Dept"] === department ?true : false;} );
    matching.every( function () {
        table.cell(this, 7).data("checking CUNYFirst")
    } );  
}
var changeStatus = function (row, s, id){
    var table = $(id).DataTable();
    table.cell(row, 7).data(s) //7 for the 7th column
}
var blank = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
        '<tr>'+
            '<td> Waiting </td>'+
            '<td> If it stays like this too long, then refresh the page </td>'+
        '</tr>'+       
    '</table>';
function format ( data ) {
    if(data[1] == "No Data" || data[1] == undefined)
        return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
        '<tr>'+
            '<td> No Teacher Information </td>'+
            '<td> If This is a mistake please help <br>others and let support know</td>'+
        '</tr>'+       
    '</table>';
    // `d` is the original data object for the row
    return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
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
    var table = $('.groupedTable').DataTable({
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
    $(".groupedTable .dataTables_empty").text("Please choose your institution and session"); 
    $('.groupedTable tbody').on('click', 'td.details-contro', function () { //open/closed
        var tr = $(this).closest('tr');
        var row = table.row( tr );
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
    $('.groupedTable tbody').on('click', 'td.details-control', function () { 
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
    var groupTable = $('#groupTable').DataTable({
        dom: "rtip",
        "columns": [
            { "data" : "Dept"},
            { "data" : "Class nbr" },
            { "data" : "Class Section" },
            { "data" : "Teacher" },
            { "data" : "Days And Time" },
            { "data" : "Group"},
        ],
        "order": [[5, 'asc']],
        responsive: true,
    }); 
});
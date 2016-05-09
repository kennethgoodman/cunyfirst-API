detCounter = {}
hiddenRowData = {}
rowsLookedAt = {}

var setAllChildrenWithDepartment = function (department){
    var table = $('#dataTables').DataTable();
    var matching = table.rows( function ( idx, data, node ) {return data["Dept"] === department ?true : false;} );
    //console.log(matching)
    matching.every( function () {
        table.cell(this, 7).data("reading from CUNYFirst")
    } );  
}
var changeStatus = function (row, s){
    //console.log("this came")
    var table = $('#dataTables').DataTable();
    table.cell(row, 7).data(s)
}
var blank = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
        '<tr>'+
            '<tr>'+
            '<td> WaitingRMP </td>'+
            '<td> If it stays like this too long, then refresh the page </td>'+
        '</tr>'+ 
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
    var table = $('#dataTables').DataTable({
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
            }
        ],
        "order": [[2, 'asc']],
    	responsive: true,
    	fixedHeader: true,
    	"deferRender": true, 
        searching: true
    });
    $("#dataTables .dataTables_empty").text("Please choose your institution and session"); 
    $('#dataTables tbody').on('click', 'td.details-contro', function () { //open/closed
        var tr = $(this).closest('tr');
        var row = table.row( tr );
        var department = row.data()['Dept']
        if (detCounter[department] != undefined ) return
        else{
            detCounter[department]= "a string"
            //console.log('detCounter[department] is now ' +detCounter[department])
            setAllChildrenWithDepartment(department)
            tr.toggleClass('selected'); //clicking info doesn't select row 
            var rowData = row.data()
            var e = document.getElementById("inst");
            values = JSON.parse(e.options[e.selectedIndex].value)
            var inst = values["schoolCode"]
            var session = values["sessionCode"]  
            var dataToSend = ["updateStatus",inst, session, rowData["Class nbr"].substring(0,rowData["Class nbr"].indexOf("-") - 1),
                              rowData["Class nbr"].substr(rowData["Class nbr"].indexOf("-") + 2),rowData["Class Section"], row.index(), rowData["Teacher"]]        
            ws.send(JSON.stringify(dataToSend))
        }

    })  
    $('#dataTables tbody').on('click', 'td.details-control', function () { 
        var tr = $(this).closest('tr');
        var row = table.row( tr );
        var rowData = row.data()

        var e = document.getElementById("inst");
        values = JSON.parse(e.options[e.selectedIndex].value)
        var inst = values["schoolCode"]
        var session = values["sessionCode"]  
        var dataToSend = ["getRMP",inst, rowData["Teacher"], row.index()]      
        if ( row.child.isShown() ) {
                // This row is already open - close it
            row.child.hide();
            //table.cell(this).data('<button type=\"button\" class=\"btn btn-info\"><span class=\"glyphicon glyphicon-info-sign\"></span> Info </button>').draw()
            tr.removeClass('shown');
        }
        else if(hiddenRowData[row.index()] != undefined){
            //table.cell(this).data('<button type=\"button\" class=\"btn btn-info\"><span class=\"glyphicon glyphicon-info-sign\"></span> Close </button>').draw()
            row.child( format(hiddenRowData[row.index()]) ).show()
            tr.addClass('shown');
            tr.toggleClass('selected'); //clicking info doesn't select row
        }
        else{
            row.child(blank).show()
            //table.cell(this).data('<button type=\"button\" class=\"btn btn-info\"><span class=\"glyphicon glyphicon-info-sign\"></span> Close </button>').draw()
            //row.data('data')
            $("#ajax-loader").show();
            tr.addClass('shown');
            ws.send(JSON.stringify(dataToSend))
            rowsLookedAt[row.index()] = true
            tr.toggleClass('selected'); //clicking info doesn't select row   
        }
    }); 
});
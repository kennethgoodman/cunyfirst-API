detCounter = {}
hiddenRowData = {}
rowsLookedAt = {}
var setAllChildrenWithDepartment = function (department, id, str){
    var table = $('#' + id).DataTable();
    var matching = table.rows( function ( idx, data, node ) {return data["Dept"] === department ?true : false;} );
    matching.every( function () {
        table.cell(this, 7).data(str)
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
var noInst = '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
        '<tr>'+
            '<td> No Institution/Session Selected </td>'+
            '<td> re-choose the institution and session </td>'+
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
        dom: "lftip", //ftipl", // l - show x entries, f - search, p - pagination, t - table, i - showing x to y of z entries
        /*select: {
            style: "multi",
            className: 'row-selected selected'
        },*/
        "columns": [
            {
                "className":      'details-control',
                "orderable":      false,
                "data":           '',
                "defaultContent": '<button type=\"button\" class=\"btn btn-info RMPButton\"><span class=\"glyphicon glyphicon-info-sign\"></span> Rate My Professor</button>'
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
                defaultContent: '<button type=\"button\" class=\"btn btn-info statusInfo\"> Open/Closed Status </button>'
            },
        ],
        "order": [[2, 'asc']],
        responsive: true,
        fixedHeader: true,
        "deferRender": true, 
        searching: true,
        "lengthMenu": [[10, 20, 50, 100], [10, 20, 50, 100]],
        "pageLength": 20
    });
    var currentlyTakingFromGroupTable = $('.currentlyTakingFromGroup').DataTable({
        dom: "tip", //ftipl", // l - show x entries, f - search, p - pagination, t - table, i - showing x to y of z entries
        "columns": [
            { "data" : "Group" },
            { "data" : "Class" },

        ],
        "order": [[1, 'asc']],
        responsive: true,
        fixedHeader: true,
        "deferRender": true, 
        searching: false,
    })
    $(".currentlyTakingFromGroup .dataTables_empty").text("Start selecting classes for them to show up here"); 
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
            var valueUnparsed = e.options[e.selectedIndex].value;
            var defaultString = "checking CUNYFirst"
            if(typeof valueUnparsed == "string" && valueUnparsed.trim() == "defualt")
                defaultString = "No Institution/Session Selected \n re-choose the institution and session"
            else {
                var values = JSON.parse(e.options[e.selectedIndex].value)
                var inst = values["schoolCode"]
                var session = values["sessionCode"]  
                var dataToSend = ["updateStatus",inst, session, rowData["Class nbr"].substring(0,rowData["Class nbr"].indexOf("-") - 1),
                                  rowData["Class nbr"].substr(rowData["Class nbr"].indexOf("-") + 2),rowData["Class Section"], row.index(), rowData["Teacher"]]        
                ws.send(JSON.stringify(dataToSend))
            }
            for(var i = 1; i <= amountOfTabs; i++)
                setAllChildrenWithDepartment(department, "groupedTable" + i, defaultString)
        }
    })  
    $('.groupedTable tbody').on('click', 'td', function() {
        if( $(this).hasClass("details-control") || $(this).hasClass("details-contro") )
            return;
        var theRow = $(this).closest('tr');
        theRow.toggleClass("row-selected selected");
        var uiCloseButton = '<span class="ui-icon ui-icon-circle-close deleteRow" role="presentation" style="float:left"></span>';
        var group = uiCloseButton + $('#TabsId li.active').children("a").text().replace("Class Group ", "");
        var children = $(this).closest('tr').children();
        var classText =  children[2].innerHTML.replace(" ", "").replace(" ","") + "-" + children[3].innerHTML;
        var rows = currentlyTakingFromGroupTable.rows().indexes();
        var data = currentlyTakingFromGroupTable.rows( rows ).data();
        for(var d in data){
            if(data[d]["Class"] === classText && data[d]["Group"] === group ){
                currentlyTakingFromGroupTable.row( d ).remove().draw( false );
                return
            }
        }
        currentlyTakingFromGroupTable.row.add( {
            "Group" : group,
            "Class" : classText
        });
        currentlyTakingFromGroupTable.draw();
        $(".currentlyTakingFromGroup .dataTables_empty").text("Start selecting classes for them to show up here"); 
        $(".deleteRow").on('click', function(){
            var children = $(this).closest("tr").children();
            var groupText = children[0].innerHTML;
            groupText = groupText.substring(groupText.lastIndexOf(">")+1);
            var tempTable = $("#groupedTable" + groupText ).DataTable();
            var rows = tempTable.rows().indexes();
            var data = tempTable.rows( rows ).data();
            for(var d in data ){
                try{ 
                    var tempStr = data[d]["Class nbr"].replace(" ", "").replace(" ","") + "-" + data[d]["Class Section"];
                    if( tempStr === children[1].innerHTML ){
                        $(tempTable.row( d ).node()).removeClass("row-selected selected");
                    }
                } catch(e) {

                }
            }
            currentlyTakingFromGroupTable.row($(this).closest("tr")).remove().draw(false)
            $(".currentlyTakingFromGroup .dataTables_empty").text("Start selecting classes for them to show up here");
        })
    })

    $('.groupedTable tbody').on('click', 'td.details-control', function () { 
        var tableId = $(this).closest('tr').closest('table').attr('id');
        var tr = $(this).closest('tr');
        var row = table.row( tr );
        var rowData = row.data()
        var e = document.getElementById("inst");
        var valueUnparsed = e.options[e.selectedIndex].value;
        var showNoInst = false;
        var dataToSend = []
        if(typeof valueUnparsed == "string" && valueUnparsed.trim() == "defualt")
            showNoInst = true
        else{
            var values = JSON.parse(e.options[e.selectedIndex].value)
            var inst = values["schoolCode"]
            var session = values["sessionCode"]  
            var teacher = rowData["Teacher"]
            dataToSend = ["getRMP", inst, teacher, row.index(), tableId ]  
        }
            
        if ( row.child.isShown() ) { // This row is already open - close it
            row.child.hide();
            tr.removeClass('shown');
        }
        else if(hiddenRowData[teacher] != undefined){
            row.child( format(hiddenRowData[teacher]) ).show()
           tr.addClass('shown');
        }
        else if(showNoInst){
            row.child(noInst).show()
            tr.addClass('shown');
            rowsLookedAt[row.index()] = true
        }
        else{
            row.child(blank).show()
            tr.addClass('shown');
            ws.send(JSON.stringify(dataToSend))
            rowsLookedAt[row.index()] = true
        }
    }); 
    $('.details-control').on('click', function(){
       console.log(this) 
    })
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
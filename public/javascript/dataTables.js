$(document).ready(function() {
    $('#dataTables').DataTable({
    	select: {
    		style: "multi",
    		className: 'row-selected selected'
    	},
    	responsive: true,
    	fixedHeader: true,
    });
    $("#dataTables .dataTables_empty").text("Please choose your institution, session and department");
     var table = $('#tableForAlreadySignedUp').DataTable({
    	responsive: true,
    	"dom": '<"top">rtp<"bottom"><"clear">',
    	select: {
    		style: "single",
    		className: "selected selectedToBeDeleted"
    	},
    });
    $("#tableForAlreadySignedUp .dataTables_empty").text("You are not signed up to be alerted for any classes");
    $('#buttonToDeleteClasses').click( function () {
        if(loggedIn){
            var temp = table.row('.selectedToBeDeleted');
            if(temp.data() == undefined) {
                alert("please pick a class to be deleted")
                return;
            }
            ws.send(JSON.stringify(["deleteClass",temp.data(),userData["username"]]));
            temp.remove().draw(false);
        }
    } );

} );

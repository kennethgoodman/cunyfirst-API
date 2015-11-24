$(document).ready(function() {
    $('#dataTables').DataTable({
    	select: {
    		style: "multi",
    		className: 'row-selected selected'
    	},
    	responsive: true,
    	fixedHeader: true,
    });
     var table = $('#tableForAlreadySignedUp').DataTable({
    	responsive: true,
    	"dom": '<"top">rtp<"bottom"><"clear">',
    	select: {
    		style: "single",
    		className: "selected selectedToBeDeleted"
    	},
    });
    if(loggedIn){
	    $('#buttonToDeleteClasses').click( function () {
	        var temp = table.row('.selectedToBeDeleted');
	        ws.send(JSON.stringify(["deleteClass",temp.data(),userData["username"]]));
	        temp.remove().draw(false);
	    } );
	}

} );

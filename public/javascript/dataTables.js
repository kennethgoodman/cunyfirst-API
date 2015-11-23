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
    $('#buttonToDeleteClasses').click( function () {
        var temp = table.row('.selectedToBeDeleted');
        ws.send(JSON.stringify(["deleteClass",temp.data()]));
        temp.remove().draw(false);
    } );

} );

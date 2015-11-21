$(document).ready(function() {
    $('#dataTables').DataTable({
    	select: {
    		style: "multi",
    		className: 'row-selected selected'
    	},
    	responsive: true,
    	fixedHeader: true,
    });
} );
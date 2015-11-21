$(document).ready(function() {
    $('#dataTables').DataTable({
    	select: {
    		style: "os",
    		className: 'row-selected selected'
    	},
    	responsive: true,
    	fixedHeader: true,
    });
} );
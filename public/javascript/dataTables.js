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
});

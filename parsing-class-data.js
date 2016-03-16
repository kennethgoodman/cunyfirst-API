var qs = require('querystring');
var request = require('request');
var cheerio = require('cheerio');
var FormData = require('form-data');
var formTemplate = require('./form');
var Xray = require('x-ray');
var x = Xray();
var db = require('./database');
var options = {
    url: 'https://hrsa.cunyfirst.cuny.edu/psc/cnyhcprd/GUEST/HRMS/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL?PortalActualURL=https%3a%2f%2fhrsa.cunyfirst.cuny.edu%2fpsc%2fcnyhcprd%2fGUEST%2fHRMS%2fc%2fCOMMUNITY_ACCESS.CLASS_SEARCH.GBL&amp;PortalContentURL=https%3a%2f%2fhrsa.cunyfirst.cuny.edu%2fpsc%2fcnyhcprd%2fGUEST%2fHRMS%2fc%2fCOMMUNITY_ACCESS.CLASS_SEARCH.GBL&amp;PortalContentProvider=HRMS&amp;PortalCRefLabel=Class%20Search&amp;PortalRegistryName=GUEST&amp;PortalServletURI=https%3a%2f%2fhome.cunyfirst.cuny.edu%2fpsp%2fcnyepprd%2f&amp;PortalURI=https%3a%2f%2fhome.cunyfirst.cuny.edu%2fpsc%2fcnyepprd%2f&amp;PortalHostNode=ENTP&amp;NoCrumbs=yes',
    headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'},
    jar: request.jar()
};
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
var classesArray = [];

getSections = function(inst, session, dept, callback){
	request.post(options, function(err, res, body) {
        if(err) {
            console.error(err);
            return;
        }
        var parsed = cheerio.load(body);
        if(body == '') {
        	if(Math.random() > .99) console.log("CUNYFIRST may be down.")
        	return false;
        }
        var key = parsed('form[name=\'win0\']>input[name=\'ICSID\']').val();
        var submit_options = {
            url: 'https://hrsa.cunyfirst.cuny.edu/psc/cnyhcprd/GUEST/HRMS/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL',
            form: qs.stringify(formTemplate.getTemplate(key,inst,session,dept,'G','0')),
            headers: options.headers,
            jar: options.jar
        };
        request.post(submit_options, function(err,res,body){
        	request.post(submit_options, function(err,res,body){
				  	callback(body)
        	})
        })
    })
}



getSections('QNS01', '1162', 'PHYS', function(q){
	console.log(q)
	// q is a chunk of html, with the nasty cunyfirst chart of class info
	/*tempHTMLChunks=q.split('COLLAPSE_1.GIF') //this will split sections of html by course section ie: ARAB 101, ARAB 203...
	var classes = []
	for(var i =1; i<tempHTMLChunks.length; i++){ //the first chunk of html has no good info
		var item = tempHTMLChunks[i].split('&nbsp;')[1]; //this will separate out and place only the course section inside of an array 
		tempHTMLChunks2 = tempHTMLChunks[i].split('Class Nbr') //separate every class number (ie 25588) into its own section
		for (var j=1; j<tempHTMLChunks2.length; j++){
			var temp= tempHTMLChunks2[j].split('</span>')
			console.log(item)
			for (m in temp){
				if (m<6){
					console.log(temp[m])
					console.log ("_____________" + m)
				}
				
			}
		}
		//console.log(classes)

	}*/
	
})
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
        		var struct = {}
        		var className = dept;
        		try{
        			var classOrder = [];
	        		x(body, ['.PABACKGROUNDINVISIBLEWBO'])(function(err,td){ //table data
				        var count = 0
				        	for(var i in td){
					            var data = td[i].split(/\n/);
					            var newData = []
					            for(var t in data){
					                if(data[t] != ""){
					                    newData.push(data[t])
					                }
					            }
					            try{
						            if(newData[0].indexOf(className) != -1){
						                if(count >= 2){ //so we dont get the first two results which have duplicate hard to parse data
						                    //var name = newData[0].substring(7,newData[0].indexOf("-") - 1)
						                    var name = newData[0].substring(2 + className.length, newData[0].indexOf("-")-1);
						                    var name = name.trim()
						                    //console.log(newData)
						                    var nbr = newData[8]
						                    classOrder.push(name);
						                    var class_nbr = newData[0].substring(2 + className.length, 2+className.length + newData[0].indexOf("-"))
						                    newData.remove(0)
						                    var d = {}
						                    d[nbr] = {}
						                    d[nbr]["Status"] = "0"
						                    try{
						                        for(var t = 0; t < newData.length; t++){  
						                            if(newData[t] == 'Status'){
						                                while(newData[t] != "Class"){
						                                    t++
						                                    if(newData[t].indexOf("Topic:" == 0)){
						                                        d[nbr]["Topic"] = newData[t].substring(6)
						                                    }
						                                    if(t > newData.length-2){
						                                        break;
						                                    }
						                                }
						                                if(t > newData.length-2){
						                                        break;
						                                    }
						                                nbr = newData[t+7]
						                                d[nbr] = {}
						                                classOrder.push(name);
						                                d[nbr]["Status"] = "0"
						                            }
						                            d[nbr][newData[t]] = newData[t+7];
						            
						                        }
						                    } catch(err){
						                        //console.log(err)
						                    }
						                    struct[name] = d
						                    //console.log(struct[name])
						                }
						                count += 1
						            }
						        } catch(err){
						        	console.log(err);
						        }
				        	}
				    	
				    })
				  	callback(body)
				} catch(err){
				    console.log(err)
				}
        	})
        })
    })
}



getSections('HTR01', '1169', 'MATH', function(q){
	// q is a chunk of html, with the nasty cunyfirst chart of class info
	tempHTMLChunks=q.split('COLLAPSE_1.GIF') //this will split sections of html by course section ie: ARAB 101, ARAB 203...
	var classes = []
	var classTitles= []; //eventually get rid of this and put item directly in
	for(var i =1; i<tempHTMLChunks.length; i++){ //the first chunk of html has no good info
		var item = tempHTMLChunks[i].split('&nbsp;')[1]; //this will separate out and place only the course section inside of an array 
		tempHTMLChunks2 = tempHTMLChunks[i].split('Class Nbr')
		for (var j=1; j<tempHTMLChunks2.length; j++){
			var temp=tempHTMLChunks2[j].split('>')
			classes.push({
				classTitle: item,
				classNum: temp[2].split('<')[0],
				daysTimes: temp[18].split('<')[0],
				room: temp[24].split('<')[0],
				instructor: temp[30].split('<')[0],
				meetingDates: temp[36].split('<')[0],
			})
		}


	}
	console.log(classes)
	
})

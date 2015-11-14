var qs = require('querystring');
var request = require('request');
var cheerio = require('cheerio');
var FormData = require('form-data');
var formTemplate = require('./form');
var Xray = require('x-ray');
var x = Xray();
var functions = require('./functions')
var db = require('./database');
var options = {
    url: 'https://hrsa.cunyfirst.cuny.edu/psc/cnyhcprd/GUEST/HRMS/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL?PortalActualURL=https%3a%2f%2fhrsa.cunyfirst.cuny.edu%2fpsc%2fcnyhcprd%2fGUEST%2fHRMS%2fc%2fCOMMUNITY_ACCESS.CLASS_SEARCH.GBL&amp;PortalContentURL=https%3a%2f%2fhrsa.cunyfirst.cuny.edu%2fpsc%2fcnyhcprd%2fGUEST%2fHRMS%2fc%2fCOMMUNITY_ACCESS.CLASS_SEARCH.GBL&amp;PortalContentProvider=HRMS&amp;PortalCRefLabel=Class%20Search&amp;PortalRegistryName=GUEST&amp;PortalServletURI=https%3a%2f%2fhome.cunyfirst.cuny.edu%2fpsp%2fcnyepprd%2f&amp;PortalURI=https%3a%2f%2fhome.cunyfirst.cuny.edu%2fpsc%2fcnyepprd%2f&amp;PortalHostNode=ENTP&amp;NoCrumbs=yes',
    headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'},
    jar: request.jar()
};
getSections = function(inst, session, dept, callback){
	request.post(options, function(err, res, body) {
        if(err) {
            console.error(err);
            return;
        }
        var parsed = cheerio.load(body);
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

			            if(newData[0].indexOf(className) != -1){
			                if(count >= 2){ //so we dont get the first two results which have duplicate hard to parse data
			                    //var name = newData[0].substring(7,newData[0].indexOf("-") - 1)
			                    var name = newData[0].substring(2 + className.length, newData[0].indexOf("-")-1);
			                    //console.log(newData)
			                    var nbr = newData[8]
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
			                                d[nbr]["Status"] = "0"
			                            }
			                            d[nbr][newData[t]] = newData[t+7];
			                        }
			                    } catch(err){
			                        //console.log(err)
			                    }
			                    struct[name] = d
			                }
			                count += 1
			            }
			        }
			    })
				//console.log(struct)
				//console.log(inst + ": " + session + " " + dept + " got class_nbr")
				for(var nbr in struct){
					for(var section in struct[nbr]){
						callback(inst, session, dept, nbr, section);
					}
				}
        	})
        })
    })
}
getDept = function(inst, session, callback){
	request.post(options, function(err, res, body) {
        if(err) {
            console.error(err);
            return;
        }
        var parsed = cheerio.load(body);
        var key = parsed('form[name=\'win0\']>input[name=\'ICSID\']').val();
        var submit_options = {
            url: 'https://hrsa.cunyfirst.cuny.edu/psc/cnyhcprd/GUEST/HRMS/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL',
            form: qs.stringify(formTemplate.getTemplate(key,inst,session,'','E','')),
            headers: options.headers,
            jar: options.jar
        };
        request.post(submit_options, function(err,res,body){
        	request.post(submit_options, function(err,res,body){
        		var p = cheerio.load(body);
        		var dept = {}
        		p('option').each(function(err,td){
        			if(td.parent.attribs.name == "SSR_CLSRCH_WRK_SUBJECT_SRCH$0"){
        				try{
        					dept[td.children[0].data] = td.attribs.value
	        				//sessions[td.children[0]['data']] = td.attribs.value;
        				} catch(err){

        				}
        			}
        		})
        		var k = 0;
        		//console.log(dept)
        		var keys = Object.keys(dept)
        		if(keys.length == 0){
        			return;
        		}
        		setInterval( function(){
        			if(k == keys.length) return;
        			//console.log(inst + ": " + session + " " + dept[keys[k]])
        			callback(inst, session, dept[keys[k]])
        			k += 1;
        		},2500)
        	})
        })
    })
}
getSession = function(inst, callback){
	request.post(options, function(err, res, body) {
        if(err) {
            console.error(err);
            return;
        }
        var parsed = cheerio.load(body);
        var key = parsed('form[name=\'win0\']>input[name=\'ICSID\']').val();
        var submit_options = {
            url: 'https://hrsa.cunyfirst.cuny.edu/psc/cnyhcprd/GUEST/HRMS/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL',
            form: qs.stringify(formTemplate.getTemplate(key,inst,'','ACCTE','E','102')),
            headers: options.headers,
            jar: options.jar
        };
        request.post(submit_options, function(err,res,body){
        	request.post(submit_options, function(err,res,body){
        		var p = cheerio.load(body)
        		var sessions = {};
        		p('option').each(function(err,td){
        			if(td.parent.attribs.name == "CLASS_SRCH_WRK2_STRM$45$"){
        				try{
        					sessions[td.children[0]['data']] = td.attribs.value;
        				} catch(err){

        				}
        			}
        		})
        		//console.log(inst + " in session")
	            callback(inst, sessions['2015 Fall Term']);
	        })
        });
    })
}
getInst = function(callback){
    request.post(options, function(err, res, body) {
        if(err) {
            console.error(err);
            return;
        }
        var parsed = cheerio.load(body);
        x(body, '.PSDROPDOWNLIST@html')(function(err,data){
            if(err){
                console.log(err)
                return
            }
            data = data.split('<option value=').join("")
            data = data.split('></option>').join("")
            data = data.split('</option>').join("")
            data = data.split('\"').join("")
            data = data.match(/[^\s]+/g);
            var schools = []
            var schoolNames = []
            var schoolName = ""
            for(var e = 1; e < data.length -1; e++){
                if(data[e].indexOf(">") == 5){
                    schools.push(data[e].substring(0,5))
                    schoolNames.push(schoolName)
                    schoolName = ""
                    data[e] = data[e].substring(6);
                }
                schoolName += " " + data[e]
            }
            schoolNames.push(schoolName)
            schoolNames.remove(0)
            var schoolStruct = {}
            for(var e in schools){
                if(e == schools.length-1) break;
                schoolStruct[schools[e]] = schoolNames[e].substring(1)
            }
            schoolStruct[schools[schools.length-1]] = schoolNames[schoolNames.length-1].substring(1)
            var k = 0;
            callback('GRD01')
    		var keys = Object.keys(schoolStruct)
    		setInterval( function(){
    			if(k == schoolStruct.length) return;
    			//console.log(keys[k])
    			callback(keys[k])
    			k += 1;
    		},1500)
        })
    })
}
deleteTable(){
	sendQuery("TRUNCATE data_for_dropdowns", function(result){
		console.log(result)
	})
}
addDataToTable(){
	getInst( function(inst){
		getSession(inst, function(inst, session){
			getDept(inst, session, function(inst,session,dept){
				getSections(inst,session,dept,function(inst,session,dept, nbr, section){
					var q = "INSERT INTO data_for_dropdowns Values (" + inst + ", " + session +", "+ dept + ", " + nbr  + ", " + section + ");" 
					sendQuery(q, function(result){
						console.log(result)
					})
				});
			})
		});
	})
}






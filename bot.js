var qs = require('querystring');
var request = require('request');
var cheerio = require('cheerio');
var FormData = require('form-data');
var formTemplate = require('./form');
var Xray = require('x-ray');
var x = Xray();
var dotenv = require('dotenv')
dotenv.load();
var functions = require('./functions')
var className = "ARAB"
var options = {
    url: 'https://hrsa.cunyfirst.cuny.edu/psc/cnyhcprd/GUEST/HRMS/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL?PortalActualURL=https%3a%2f%2fhrsa.cunyfirst.cuny.edu%2fpsc%2fcnyhcprd%2fGUEST%2fHRMS%2fc%2fCOMMUNITY_ACCESS.CLASS_SEARCH.GBL&amp;PortalContentURL=https%3a%2f%2fhrsa.cunyfirst.cuny.edu%2fpsc%2fcnyhcprd%2fGUEST%2fHRMS%2fc%2fCOMMUNITY_ACCESS.CLASS_SEARCH.GBL&amp;PortalContentProvider=HRMS&amp;PortalCRefLabel=Class%20Search&amp;PortalRegistryName=GUEST&amp;PortalServletURI=https%3a%2f%2fhome.cunyfirst.cuny.edu%2fpsp%2fcnyepprd%2f&amp;PortalURI=https%3a%2f%2fhome.cunyfirst.cuny.edu%2fpsc%2fcnyepprd%2f&amp;PortalHostNode=ENTP&amp;NoCrumbs=yes',
    headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'},
    jar: request.jar()
};
var text = require('./texting')
var struct = {};
addData = function(body, className){
    var struct = {};
    var p = cheerio.load(body)
            x(body, ['.PABACKGROUNDINVISIBLEWBO'])(function(err,td){
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
                        if(count >= 2){ //so we dont get the first two results
                            var name = newData[0].substring(7,newData[0].indexOf("-") - 1)
                            var nbr = newData[8]
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
            var temp = [];
            p('.SSSIMAGECENTER').each(function(err,open){
                temp.push(open.attribs.alt)
            })
            var counter = 0
            for(i in struct){
                for(j in struct[i]){
                    struct[i][j]["Status"] = temp[counter++]
                }
            }
    return struct;
}
getClasses = function(inst,semester,subject,option,nbr,callback){
    request.post(options, function(err, res, body) {
        if(err) {
            console.error(err);
            return;
        }
        var parsed = cheerio.load(body);
        var key = parsed('form[name=\'win0\']>input[name=\'ICSID\']').val();
        var submit_options = {
            url: 'https://hrsa.cunyfirst.cuny.edu/psc/cnyhcprd/GUEST/HRMS/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL',
            form: qs.stringify(formTemplate.getTemplate(key,inst, semester, subject,option,nbr)),
            headers: options.headers,
            jar: options.jar
        };
        request.post(submit_options, function(err,res,body){
            request.post(submit_options, function(err, res, body){
                var struct = addData(body, subject)
                //console.log(struct)
                console.log('102, section 58211 is ' + struct['102']['58211']['Status']);
                console.log('102, section 58210 is ' + struct['102']['58210']['Status']);
                callback(struct['102']['58211']['Status'],'102, section 58211 is ' + struct['102']['58211']['Status'])
                callback(struct['102']['58210']['Status'],'102, section 58210 is ' + struct['102']['58210']['Status'])
                return struct
            })
        }) 
    });
};
//var struct = getClasses('QNS01','1162','ARAB','E','102');

//Gets Schools
getSchools = function(callback){
    console.log("here")
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
                schoolStruct[schools[e]] = schoolNames[e]
            }
            schoolStruct[schools[schools.length-1]] = schoolNames[schoolNames.length-1]
            console.log("returning")
            callback(schoolStruct)
        })
    })
}

/*
request.post(options, function(err, res, body) {
    if(err) {
        console.error(err);
        return;
    } 
    
    var parsed = cheerio.load(body);
    var key = parsed('form[name=\'win0\']>input[name=\'ICSID\']').val();
    //console.log(key)
    //formData = formTemplate.getTemplate(key, 'QNS01', '1162', 'ARAB');
    
    var submit_options = {
        url: 'https://hrsa.cunyfirst.cuny.edu/psc/cnyhcprd/GUEST/HRMS/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL',
        form: qs.stringify(formTemplate.getTemplate(key,'QNS01', '1162', className,'E','102')),
        headers: options.headers,
        jar: options.jar
    };

    request.post(submit_options, function(err, res, body) {
        console.log(submit_options.form)
        request.post(submit_options, function(err, res, body) {
            var p = cheerio.load(body)
            x(body, ['.PABACKGROUNDINVISIBLEWBO'])(function(err,td){
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
                        if(count >= 2){ //so we dont get the first two results
                            var name = newData[0].substring(7,newData[0].indexOf("-") - 1)
                            var nbr = newData[8]
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
            var temp = [];
            p('.SSSIMAGECENTER').each(function(err,open){
                temp.push(open.attribs.alt)
            })
            var counter = 0
            for(i in struct){
                for(j in struct[i]){
                    struct[i][j]["Status"] = temp[counter++]
                }
            }
            console.log(struct)  
        });
    });
});*/
var texted = false;
setInterval(function(){
    var a = getClasses('QNS01','1162','ACCT','E','102',
        function(status,text){
            if(status == "Closed" && !texted){
                var nbr = '5164046348'
                send_message(nbr,text)
                texted = true
            }
        });
},2500)
getStruct = function(){
    return struct;
}
getClassByNumber = function(nbr){
    return struct[nbr]
}
getClassesByFunction = function(f){
    var temp = []
    for(var classes in struct){
        if(f(classes)){
            var d ={}
            d[classes] = struct[classes]
            temp.push(d)
        }
    }
    return temp
}
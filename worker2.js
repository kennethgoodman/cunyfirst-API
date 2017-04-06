try{
    var dotenv = require('dotenv')
    dotenv.load();
}catch(err){
    //do nothing if this fails, we are in dev
}
var qs = require('querystring');
var request = require('request');
var cheerio = require('cheerio');
var FormData = require('form-data');
var formTemplate = require('./form');
var Xray = require('x-ray');
var x = Xray();
var db = require('./database');
var options = {
    url: process.env.cunyfirst_search_url,
    headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'},
    jar: request.jar()
};
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

var classesArray = [];
var urlProducer = function (icsid, icstate, inst, session){
    return 'https://hrsa.cunyfirst.cuny.edu/psc/cnyhcprd/GUEST/HRMS/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL?ICAJAX=1&ICNAVTYPEDROPDOWN=0&ICType=Panel&ICElementNum=0&ICStateNum='
        +icstate+
        '&ICAction=CLASS_SRCH_WRK2_STRM$35$&ICXPos=0&ICYPos=0&ResponsetoDiffFrame=-1&TargetFrameName=None&FacetPath=None&ICFocus&ICSaveWarningFilter=0&ICChanged=-1&ICAutoSave=0&ICResubmit=0&ICSID='
        +icsid+
        '=&ICActionPrompt=false&ICBcDomData=undefined&ICFind&ICAddCount&ICAPPCLSDATA&CLASS_SRCH_WRK2_INSTITUTION$31$='
        +inst+
        '&CLASS_SRCH_WRK2_STRM$35$='
        +session
}
var urlProducerClasses = function (icsid, icstate, session, subject){
    return 'https://hrsa.cunyfirst.cuny.edu/psc/cnyhcprd/GUEST/HRMS/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL?ICAJAX=1&ICNAVTYPEDROPDOWN=0&ICType=Panel&ICElementNum=0&ICStateNum='
        +icstate+
        '&ICAction=CLASS_SRCH_WRK2_SSR_PB_CLASS_SRCH&ICXPos=0&ICYPos=0&ResponsetoDiffFrame=-1&TargetFrameName=None&FacetPath=None&ICFocus&ICSaveWarningFilter=0&ICChanged=-1&ICAutoSave=0&ICResubmit=0&ICSID='
        +icsid+
        '=&ICActionPrompt=false&ICBcDomData=undefined&ICFind&ICAddCount&ICAPPCLSDATA&CLASS_SRCH_WRK2_STRM$35$='
        +session+
        '&SSR_CLSRCH_WRK_SUBJECT_SRCH$0='
        +subject+
        '&SSR_CLSRCH_WRK_SSR_EXACT_MATCH1$1=G&SSR_CLSRCH_WRK_CATALOG_NBR$1=0&SSR_CLSRCH_WRK_SSR_OPEN_ONLY$chk$5=N'
}


getSections = function (inst, session, dept, callback){
    request.get(options, function(err, res, body) {
        if(err) {
            console.error(err);
            return;
        }
        var parsed = cheerio.load(body);
        var key = body.split("id=\'ICSID\' value=\'")[1].substring(0, 44);
        submit_options = {
            url: urlProducer(key, '1', inst, session),
            headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'},
            jar: options.jar
        }
        request.get(submit_options, function (err, res, body){
            request.get(submit_options, function(err, res, body){
                submit_options['url']= urlProducerClasses(key, '2', session, dept)
                request.get(submit_options, function (err, res, body){
                    //console.log(body)
                })
            })
                
        })
    })
}
getSections ('QNS01', '1169', 'CSCI', function (){
    console.log();
})

getDept = function(inst, session, callback){
	request.post(options, function(err, res, body) {
        if(err) {
            console.error(err);
            return;
        }
        var parsed = cheerio.load(body);
        var key = body.split("id=\'ICSID\' value=\'")[1].substring(0, 44);
        submit_options = {
            url: urlProducer(key, '1', inst, session),
            headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'},
            jar: options.jar
        }
        request.get(submit_options, function (err, res, body){
            request.get(submit_options, function (err, res, body){
                console.log(body)
                //parse this for subjects
            })
        })
    })
}
/*getDept('QNS01', '1162', function(result){
    console.log('hii')
})*/

getSession = function (inst, callback){
    request.post(options, function(err, res, body) {
        if(err) {
            console.error(err);
            return;
        }
        var parsed = cheerio.load(body);
        var key = body.split("id=\'ICSID\' value=\'")[1].substring(0, 44);
        //console.log(key)
        var submit_options = {
            url: urlProducer(key, '1', inst, ''),
            headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'},
            jar: options.jar
        };
        request.get(submit_options, function(err,res,body){
            //parse this for session
        })
    })
}

/*getSession('QNS01', function(result){
    console.log(result)
})*/

getInst = function(callback){
    request.post(options, function(err, res, body) {
        try{
            if(body.length == 0) return;
        } catch(err){
            console.log(err)
            return false;
        }
        if(err) {
            console.error(err);
            return;
        }
        var parsed = cheerio.load(body);
        x(body, '.PSDROPDOWNLIST@html')(function(err,data){
            if(err){
                logger.error(err)
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
            callback(schoolStruct);
        })
    })
}

/*getInst(function(r){
    console.log(r)
})*/

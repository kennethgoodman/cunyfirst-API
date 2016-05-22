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

var parseDropdownOptions = function(body, selectIndexString, callback){
    var selectIndex = body.indexOf(selectIndexString)
    var selectHtml = body.substring(selectIndex)
    var selectHtml = selectHtml.substring(selectHtml.indexOf("<option"), selectHtml.indexOf("</select>"))
    
    optionsString = selectHtml.split('<option value=').join("")
    optionsString = optionsString.split('></option>').join("")
    optionsString = optionsString.split('</option>').join("")
    optionsString = optionsString.split("selected").join("")
    optionsString = optionsString.split('\"').join("")
    optionsString = optionsString.split("=").join("")
    optionsString = optionsString.split("\'").join("")
    
    var options = optionsString.split("\n")
    valueTextStruct = {}
    for(var i = 1; i < options.length - 1 ; i++){
        temp = options[i].split(">")
        valueTextStruct[temp[1]] = temp[0]
    }
    callback(valueTextStruct)
}

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
                    body = body.substring(body.indexOf("win0divSSR_CLSRSLT_WRK_GROUPBOX2$"))
                    bodySplit = body.split("win0divSSR_CLSRSLT_WRK_GROUPBOX2$") //split by section
                    for(var i = 1; i < bodySplit.length - 1; i++){
                        var temp = bodySplit[i]
                        //get class:
                        var classNumber = temp.substring(temp.indexOf("/a>")+3, temp.indexOf("</DIV>"))
                        console.log(classNumber.split("&nbsp;").join(""))
                        //get class
                        var tableWithAllClasses = temp.substring(temp.indexOf("ACE_$ICField48"))
                        console.log("--------")
                        rowsSplit = tableWithAllClasses.split("ACE_SSR_CLSRSLT_WRK_GROUPBOX3")
                        for(var j = 1; j < rowsSplit.length - 1; j++){
                            var temp2 = rowsSplit[j]

                            var section = temp2.substr(temp2.indexOf("win0divMTG_CLASS_NBR"))
                            var section = section.substr(section.indexOf("</a>") - 5, 5)
                            console.log(section)

                            var className = temp2.substr(temp2.indexOf("win0divMTG_CLASSNAME"))
                            var className = className.substr(className.indexOf("</a>")-25,25)
                            var className = className.substring(className.indexOf(">")+1, className.indexOf("<"))
                            console.log("--------")
                            console.log(className)

                            var dayTime = temp2.substr(temp2.indexOf("win0divMTG_DAYTIME"))
                            var dayTime = dayTime.substr(dayTime.indexOf("</span>")-25, 50)
                            var dayTime = dayTime.substring(dayTime.indexOf(">")+1, dayTime.indexOf("<")) 
                            console.log("--------")
                            console.log(dayTime)


                            var room = temp2.substr(temp2.indexOf("win0divMTG_ROOM"))
                            var room = room.substr(room.indexOf("</span>")-25, 50)
                            var room = room.substring(room.indexOf(">")+1, room.indexOf("<")) 
                            console.log("--------")
                            console.log(room)

                            var teacher = temp2.substr(temp2.indexOf("win0divMTG_INSTR"))
                            var teacher = teacher.substr(teacher.indexOf("</span>")-25, 50)
                            var teacher = teacher.substring(teacher.indexOf(">")+1, teacher.indexOf("<")) 
                            console.log("--------")
                            console.log(teacher)

                            var meetingTimes = temp2.substr(temp2.indexOf("win0divMTG_TOPIC"))
                            var meetingTimes = meetingTimes.substr(meetingTimes.indexOf("</span>")-25, 50)
                            var meetingTimes = meetingTimes.substring(meetingTimes.indexOf(">")+1, meetingTimes.indexOf("<")) 
                            console.log("--------")
                            console.log(meetingTimes)


                            var status = temp2.substr(temp2.indexOf("win0divDERIVED_CLSRCH_SSR_STATUS_LONG"))
                            var status = status.substr(status.indexOf("alt=") + 5, 12)
                            var status = status.substring(0, status.indexOf("\"")) 
                            console.log("--------")
                            console.log(status)

                            var core = temp2.substr(temp2.indexOf("win0divDERIVED_CLSRCH_DESCRLONG"))
                            var core = core.substring(core.indexOf("<span")+1,core.indexOf("</span>"))
                            var core = core.substring(core.indexOf(">")+1)
                            var core = core.replace("amp;","") 
                            console.log("--------")
                            console.log(core)
                            break
                        }
                        break
                        // //bodySplit[i] = bodySplit.substring(bodySplit.indexOf("ACE_$ICField48$"))
                        // //
                        // bodySplit[i] = bodySplit.substring(bodySplit.indexOf("<tbody>"),bodySplit.indexOf("</tbody>"))
                        // rowSplit = bodySplit[i].split("<tr>")
                        // console.log(bodySplit[i])
                    }
                    //parse this for subjects
                })
            })
                
        })
    })
}
getSections ('QNS01', '1169', 'MATH', function (){
    //console.log();
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
                var selectIndexString = "select name='SSR_CLSRCH_WRK_SUBJECT_SRCH$"
                parseDropdownOptions(body, selectIndexString, callback)
            })
        })
    })
}
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
            var selectIndexString = "id='CLASS_SRCH_WRK2_STRM$35$"
            parseDropdownOptions(body, selectIndexString, callback)
        })
    })
}

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
            var selectIndexString = "select name='CLASS_SRCH_WRK2_INSTITUTION$31$"
            parseDropdownOptions(body, selectIndexString, callback)
        })
    })
}

try{
    var dotenv = require('dotenv')
    dotenv.load();
}catch(err){
    //do nothing if this fails, we are in dev
}
logger = require('tracer').console({
    format : [ "<{{title}}> {{file}}:{{line}}: {{message}}",
        {
            error: "<{{title}}> {{file}}:{{line}}: {{message}} \nCall Stack: {{stack}}",
            debug: "{{timestamp}} <{{title}}> {{file}}:{{line}}: {{message}}",
            dateformat : " h:MM:ss TT"
        }],
    preprocess: function(data){ data.title = data.title.toUpperCase()}
})

var qs = require('querystring');
var request = require('request');
var cheerio = require('cheerio');
var FormData = require('form-data');
var formTemplate = require('./form');
var Xray = require('x-ray');
var x = Xray();
var db = require('./database');
var options = {
    uri: process.env.cunyfirst_search_url,
    headers: {'User-Agent': 'request'},//'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'},
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
    selectHtml = selectHtml.substring(selectHtml.indexOf("<option"), selectHtml.indexOf("</select>"))

    optionsString = selectHtml.split('<option value=').join("")
    optionsString = optionsString.replace("&nbsp;","")
    optionsString = optionsString.replace("&nbsp;","")
    optionsString = optionsString.split('></option>').join("")
    optionsString = optionsString.split('</option>').join("")
    optionsString = optionsString.split("selected").join("")
    optionsString = optionsString.split('\"').join("")
    optionsString = optionsString.split("=").join("")
    optionsString = optionsString.split("\'").join("")

    var options = optionsString.split("\n")
    valueTextStruct = {}
    for(var i = 1; i < options.length - 1 ; i++){
        temp = options[i].replace("&#039;", "\'").replace("&#039;", "\'").replace("&#039;", "\'").replace("&#039;", "\'")
        temp = options[i].split(">")
        temp[1] = temp[1].trim()
        temp[0] = temp[0].trim()
        valueTextStruct[temp[1]] = temp[0]
    }
    callback(valueTextStruct)
}

var classesArray = [];
var urlProducer = function (icsid, ICStateNum, inst, session){
    return 'https://hrsa.cunyfirst.cuny.edu/psc/cnyhcprd/GUEST/HRMS/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL?ICAJAX=1&ICNAVTYPEDROPDOWN=0&ICType=Panel&ICElementNum=0&ICStateNum='
        +ICStateNum+
        '&ICAction=CLASS_SRCH_WRK2_STRM$35$&ICXPos=0&ICYPos=0&ResponsetoDiffFrame=-1&TargetFrameName=None&FacetPath=None&ICFocus&ICSaveWarningFilter=0&ICChanged=-1&ICAutoSave=0&ICResubmit=0&ICSID='
        +icsid+
        '=&ICActionPrompt=false&ICBcDomData=undefined&ICFind&ICAddCount&ICAPPCLSDATA&CLASS_SRCH_WRK2_INSTITUTION$31$='
        +inst+
        '&CLASS_SRCH_WRK2_STRM$35$='
        +session
}
var urlProducerClasses = function (icsid, ICStateNum, session, subject){
    return 'https://hrsa.cunyfirst.cuny.edu/psc/cnyhcprd/GUEST/HRMS/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL?ICAJAX=1&ICNAVTYPEDROPDOWN=0&ICType=Panel&ICElementNum=0&ICStateNum='
        +ICStateNum+
        '&ICAction=CLASS_SRCH_WRK2_SSR_PB_CLASS_SRCH&ICXPos=0&ICYPos=0&ResponsetoDiffFrame=-1&TargetFrameName=None&FacetPath=None&ICFocus&ICSaveWarningFilter=0&ICChanged=-1&ICAutoSave=0&ICResubmit=0&ICSID='
        +icsid+
        '=&ICActionPrompt=false&ICBcDomData=undefined&ICFind&ICAddCount&ICAPPCLSDATA&CLASS_SRCH_WRK2_STRM$35$='
        +session+
        '&SSR_CLSRCH_WRK_SUBJECT_SRCH$0='
        +subject+
        '&SSR_CLSRCH_WRK_SSR_EXACT_MATCH1$1=G&SSR_CLSRCH_WRK_CATALOG_NBR$1=0&SSR_CLSRCH_WRK_SSR_OPEN_ONLY$chk$5=N'
}


getSections = function (inst, session, dept, callback){
    var dept1= dept; //only here temporarily
    //console.log('requesting '+inst+ ' '+session+ ' '+dept)
    options['uri'] = 'https://hrsa.cunyfirst.cuny.edu/psc/cnyhcprd/GUEST/HRMS/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL?&';
    request.post(options, function(err, res, body) {
        if(err) {
            if(global.LOG_CF_DOWN == false) {
                logger.error("Error %j", err)
                logger.log("CUNYFIRST may be down")
                global.LOG_CF_DOWN = true
            }
            global.CUNYFIRST_DOWN = true
            callback("CUNYFIRST may be down")
            return
        }
        var parsed = cheerio.load(body);
        var key;
        var ICStateNum = body.split("id=\'ICStateNum\' value=\'")[1].split("\'")[0];
        try{
            key = body.split("id=\'ICSID\' value=\'")[1].substring(0, 44);
        }
        catch(err){
            if(global.LOG_CF_DOWN == false) {
                logger.error("Error %j", err)
                logger.log("CUNYFIRST may be down")
                global.LOG_CF_DOWN = true
            }
            global.CUNYFIRST_DOWN = true
            callback("CUNYFIRST may be down")
            return
        }
        submit_options = {
            uri: urlProducer(key, ICStateNum, inst, session),
            headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'},
            jar: options.jar
        }
        request.get(submit_options, function(err, res, body){
            submit_options['uri']= urlProducerClasses(key, ++ICStateNum, session, dept)
            request.get(submit_options, function (err, res, body){
                var struct = {}
                body = body.substring(body.indexOf("win0divSSR_CLSRSLT_WRK_GROUPBOX2$"))
                bodySplit = body.split("win0divSSR_CLSRSLT_WRK_GROUPBOX2$") //split by section

                for(var i = 1; i < bodySplit.length; i++){
                    var temp = bodySplit[i]

                    var classNumberAndInfo = temp.substring(temp.indexOf("/a>")+3, temp.indexOf("</DIV>")).split("&nbsp;").join("")
                    var classNumber = classNumberAndInfo.split(" ")
                    var dept = classNumber[0]

                    if(classNumber[1] == '')
                        classNumber = classNumber[2]
                    else
                        classNumber = classNumber[1]

                    struct[classNumber] = {}

                    var tableWithAllClasses = temp.substring(temp.indexOf("ACE_$ICField48"))
                    rowsSplit = tableWithAllClasses.split("ACE_SSR_CLSRSLT_WRK_GROUPBOX3")
                    for(var j = 1; j < rowsSplit.length; j++){
                        var temp2 = rowsSplit[j]

                        temp2 = temp2.substr(temp2.indexOf("win0divMTG_CLASS_NBR"))
                        var section = temp2.substr(temp2.indexOf("</a>") - 5, 5)
                        if (section.charAt(0) == '>') section= section.substr(1, 4) //fixed 4 digit section # problem
                        try{
                            struct[classNumber][section] = { "Section" : section }
                        } catch(error){
                            logger.error("error: %j", error)
                            break
                        }

                        temp2 = temp2.substr(temp2.indexOf("win0divMTG_CLASSNAME"))
                        var className = temp2.substr(temp2.indexOf("</a>")-25,25)
                        className = className.substring(className.indexOf(">")+1, className.indexOf("<"))
                        try{
                            struct[classNumber][section]["className"] = className
                        } catch(error){
                            struct[classNumber][section]["className"] = 'NA'
                        }

                        temp2 = temp2.substr(temp2.indexOf("win0divMTG_DAYTIME"))
                        var dayTime = temp2.substr(temp2.indexOf("</span>")-25, 50)
                        dayTime = dayTime.substring(dayTime.indexOf(">")+1, dayTime.indexOf("<"))
                        try{
                            struct[classNumber][section]["Days & Times"] = dayTime
                        } catch(error){
                            struct[classNumber][section]["Days & Times"] = 'NA'
                        }

                        temp2 = temp2.substr(temp2.indexOf("win0divMTG_ROOM"))
                        var room = temp2.substr(temp2.indexOf("</span>")-25, 50)
                        room = room.substring(room.indexOf(">")+1, room.indexOf("<"))
                        try{
                            struct[classNumber][section]["Room"] = room
                        } catch(error){
                            struct[classNumber][section]["Room"] = 'NA'
                        }

                        temp2 = temp2.substr(temp2.indexOf("win0divMTG_INSTR"))
                        var teacher = temp2.substr(temp2.indexOf("</span>")-25, 50)
                        teacher = teacher.substring(teacher.indexOf(">")+1, teacher.indexOf("<"))
                        try{
                            struct[classNumber][section]["Instructor"] = teacher
                        } catch(error){
                            struct[classNumber][section]["Instructor"] = 'NA'
                        }

                        temp2 = temp2.substr(temp2.indexOf("win0divMTG_TOPIC"))
                        var meetingDays = temp2.substr(temp2.indexOf("</span>")-25, 50)
                        meetingDays = meetingDays.substring(meetingDays.indexOf(">")+1, meetingDays.indexOf("<"))
                        try{
                            struct[classNumber][section]["Dates"] = meetingDays
                        } catch(error){
                            struct[classNumber][section]["Dates"] = 'NA'
                        }

                        temp2 = temp2.substr(temp2.indexOf("win0divDERIVED_CLSRCH_SSR_STATUS_LONG"))
                        var status = temp2.substr(temp2.indexOf("alt=") + 5, 12)
                        status = status.substring(0, status.indexOf("\""))
                        try{
                            struct[classNumber][section]["Status"] = status
                        } catch(error){
                            struct[classNumber][section]["Status"] = 'NA'
                        }

                        var Topic = temp2.substr(temp2.indexOf("win0divDERIVED_CLSRCH_DESCRLONG"));
                        Topic = Topic.substring(Topic.indexOf("<span")+1,Topic.indexOf("</span>"));
                        Topic = Topic.substring(Topic.indexOf(">")+1);
                        Topic = Topic.replace("amp;","");
                        try{
                            struct[classNumber][section]["Topic"] = Topic;
                        } catch(error){
                            struct[classNumber][section]["Topic"] = 'NA';
                        }

                        struct[classNumber][section]["Class Title"] = classNumberAndInfo;
                        struct[classNumber][section]["Dept"] = dept;
                    }
                }

                if(Object.keys(struct).length === 0 && struct.constructor === Object){
                    //logger.log("no keys "+inst+ ' '+session+ ' '+dept1)
                    //logger.log(struct)
                    //global.CUNYFIRST_DOWN = true
                    callback(struct);
                }
                else{
                    callback(struct);
                }
            })
        })
    })
};
getDept = function(inst, session, callback){
    options['uri'] = 'https://hrsa.cunyfirst.cuny.edu/psc/cnyhcprd/GUEST/HRMS/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL?&';
    request.post(options, function(err, res, body) {
        if(err) {
            logger.error(err);
            return;
        }
        var parsed = cheerio.load(body);
        var key = body.split("id=\'ICSID\' value=\'")[1].substring(0, 44);
        var ICStateNum = body.split("id=\'ICStateNum\' value=\'")[1].split("\'")[0];
        submit_options = {
            uri: urlProducer(key, ICStateNum, inst, session),
            headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'},
            jar: options.jar
        };
        request.get(submit_options, function (err, res, body){
            var selectIndexString = "select name='SSR_CLSRCH_WRK_SUBJECT_SRCH$"
            parseDropdownOptions(body, selectIndexString, callback)
        })
    })
};

getSession = function (inst, callback){
    options['uri'] = 'https://hrsa.cunyfirst.cuny.edu/psc/cnyhcprd/GUEST/HRMS/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL?&';
    request.post(options, function(err, res, body) {
        if(err) {
            logger.error(err);
            return;
        }
        var key = body.split("id=\'ICSID\' value=\'")[1].substring(0, 44);
        var ICStateNum = body.split("id=\'ICStateNum\' value=\'")[1].split("\'")[0];
        var submit_options = {
            uri: urlProducer(key, ICStateNum, inst, ''),
            headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'},
            jar: options.jar
        };
        request.get(submit_options, function(err,res,body){
            var selectIndexString = "id='CLASS_SRCH_WRK2_STRM$35$"
            parseDropdownOptions(body, selectIndexString, function(sessions){ callback(inst, sessions) })
        })
    })
}

getInst = function(callback){
    options['uri'] = 'https://hrsa.cunyfirst.cuny.edu/psc/cnyhcprd/GUEST/HRMS/c/COMMUNITY_ACCESS.CLASS_SEARCH.GBL?&';
    request.get(options, function(err, res, body) {
        if(err) {
            logger.error(err);
            return;
        }
        try{
            if(body.length == 0) return;
        } catch(error) {
            logger.log(error);
            return false;
        }
        var selectIndexString = "select name='CLASS_SRCH_WRK2_INSTITUTION$31$"
        parseDropdownOptions(body, selectIndexString, callback)
    })
}

getSections2 = function (triplet,callback){ // for some reason, CF wants the user to select inst, then session, then dept, then search
    var inst = triplet.inst;
    var session = triplet.session;
    var dept = triplet.dept;
    getInst(function (_){
        getSession(inst, function(_, _){
            getDept(inst, session, function(_){
                getSections(inst, session, dept, function(classes){
                    callback(triplet, classes)
                })
            })
        })
    })
};
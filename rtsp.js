fs = require("fs");
var url = require("url");

Stream = require("node-rtsp-stream-jsmpeg");
var log4js = require("log4js");
const {suspend, resume} = require('ntsuspend');
const net = require('net');
log4js.configure({
    appenders: {
        app: {type: 'dateFile', filename: './log/rtsp', pattern: 'yyyy-MM-dd.log', alwaysIncludePattern: true},
        console: {type: "console"}
    },
    categories: {default: {appenders: ["app", "console"], level: "all"}},
});
var logger = log4js.getLogger('rtsp');
logger.level = "all";
var ServerSetting = require("./config.js");
var connected = false

let option = {chs: [], host: ServerSetting.host};
let dvrurl = "/cgi-bin/net_video.cgi?hq=0";
/*
wsPort:每支攝影機都要有設定個PORT
rtspch:RSTP URL(目前不使用)
chname:攝影機名稱
ch:第X支轉為2進制
 */
//http://admin:abcd1234@rtspcameratest.ddns.net:8080/cgi-bin/net_video.cgi?hq=0&audio=1&iframe=1&pframe=1
//let dvrs = [{id: "1", wsPort: 6001, rtspch: "main_0", chname: "第一支", ch: "00000001"}]; //攝影機,00000010第2支
let dvrs = []; //攝影機,00000010第2支

for (var i=1;i<=ServerSetting.camerLength;i++){
    var k = "";
    for (j = 1; j < i; j++) {
        k = k + "0";
    }
    dvrs.push({id: i, wsPort: 6000 + (i * 3), rtspch: "main_0", chname:'', ch: ("1" + k).padStart(8, "0")})
}
for (i = 0; i < dvrs.length; i++) {
    //串流啟動參數,&audio=1&iframe=1&pframe=1
    var data = {
        name: dvrs[i].chname,
        ch: dvrs[i].ch,
        url: dvrurl,
        durl: dvrurl,
        width: 640,
        height: 480,
        id: dvrs[i].id
    };
    option.chs.push(data);


}

//getONVIFDevice()

//let dvrs = [{id: "1", wsPort: 6001, rtspch: "main_0", chname: "第一支", ch: "00000001"}]; //攝影機,00000010第2支
const httpServer = require("http").createServer(function (req, res) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    let html = "";
    try {
        logger.info(url.parse(req.url).pathname);
        html = fs.readFileSync(__dirname + url.parse(req.url).pathname, "utf8");
        //logger.info(html);
    } catch (e) {
    }
    res.write(html);
    res.end();
});
httpServer.listen(3000);

const io = require("socket.io")(httpServer, {});
//var videoobj;
io.on("connection", async (socket) => {
    var sessionID = socket.id;
    for (i = 0; i < option.chs.length; i++) {
        option.chs[i].wsPort = getRandom(15000, 5000)

        await probe(option.chs[i].wsPort, function (bl, _pt) {
            if (!bl === true) {
                option.chs[i].wsPort = getRandom(15000, 5000)
            }
        });
        global["video" + "_" + sessionID + "_" + option.chs[i].wsPort] = null;
    }
    //logger.info(option);
    io.emit("getList", option);

    socket.on("windowSize", function (obj) {

        var t = ((obj.width-50)/ServerSetting.videoWidth);

        ServerSetting.videoWidth=obj.width;
        ServerSetting.videoHeight =obj.height;

    });

    socket.on("suspend", function (obj) {
        try {
            suspend(global["video" + "_" + sessionID + "_" + obj.wsPort].mpeg1Muxer.stream.pid)
        } catch (error) {

        }


    });
    socket.on("resume", function (obj) {
        try {
            resume(global["video" + "_" + sessionID + "_" + obj.wsPort].mpeg1Muxer.stream.pid)
        } catch (error) {

        }

    });


    socket.on("disconnect", function () {
        for (const name of varsList()) {
            //console.log(name);
            //logger.info("video_" + sessionID)
            if (name.startsWith("video_" + sessionID)) {
                //logger.info(global["video" + "_" + option.chs[i].wsPort].server.clients.length);
                //logger.info(global[name].server.clients.length)

                //if (global[name] == undefined) {

                //}else{
                //if (global[name].server.clients.length - 1 <= 0) {
                try {
                    process.kill(global[name].mpeg1Muxer.stream.pid);
                    global[name].stop();
                    global[name] = null;
                } catch (error) {
                    //logger.info(error);
                }
                //}
                //}
                global[name] = null;
            }

        }
    });
    /*
    停止撥放
    1.停止WEB SOCKECT,刪除FFMPEG轉檔process
     */
    socket.on("chastop", function () {
        for (const name of varsList()) {
            if (name.startsWith("video_" + sessionID)) {
                //logger.info(global[name]);
                if (global[name] == undefined) {

                } else {
                    try {
                        process.kill(global[name].mpeg1Muxer.stream.pid);
                        global[name].stop();
                        global[name] = null;
                    } catch (error) {
                        //logger.info(error);
                    }
                }
                global[name] = null;
            }

        }
    });
    socket.on("chastart", async function (obj) {
        logger.info(obj.wsPort)
        obj.url = "http://" + ServerSetting.username + ":" + ServerSetting.userpass + "@" + ServerSetting.host + ":" + ServerSetting.port + obj.url
        obj.ServerSetting = ServerSetting;
        var flg = global["video" + "_" + sessionID + "_" + obj.wsPort];
        try {

            //檢查PORT是否有被使用

            await probe(obj.wsPort, function (bl, _pt) {
                logger.info(bl);
                if (bl === true) {
                    if (flg == undefined) {
                        //if(b==0)
                        try {
                            process.kill(global["video" + "_" + sessionID + "_" + obj.wsPort].mpeg1Muxer.stream.pid);
                            global[name].stop();
                            global[name] = null;
                        } catch (error) {
                            //logger.info(error);
                        }
                        global["video" + "_" + sessionID + "_" + obj.wsPort] = new Stream(obj).start();
                    } else {
                        try {
                            process.kill(global["video" + "_" + sessionID + "_" + obj.wsPort].mpeg1Muxer.stream.pid);
                            global[name].stop();
                            global[name] = null;
                        } catch (error) {
                            //logger.info(error);
                        }
                        logger.info("chastart-b-117:" + flg.server.clients.length);
                        if (flg.server.clients.length == 0) {
                            global["video" + "_" + sessionID + "_" + obj.wsPort] = new Stream(obj).start();
                        }
                        //logger.info("b:" + global["video" + "_" + sessionID + "_" + obj.wsPort].server.clients.length);
                    }
                } else {
                    for (const name of varsList()) {
                        if (name.startsWith("video_" + sessionID)) {
                            //logger.info(global[name]);
                            if (global[name] == undefined) {

                            } else {
                                try {
                                    process.kill(global[name].mpeg1Muxer.stream.pid);
                                    global[name].stop();
                                    global[name] = null;
                                } catch (error) {
                                    //logger.info(error);
                                }
                            }
                            global[name] = null;
                        }

                    }
                    if (flg == undefined) {
                        //if(b==0)
                        global["video" + "_" + sessionID + "_" + obj.wsPort] = new Stream(obj).start();
                    } else {
                        logger.info("chastart-b-117:" + global["video" + "_" + sessionID + "_" + obj.wsPort].server.clients.length);
                        if (flg.server.clients.length == 0) {
                            global["video" + "_" + sessionID + "_" + obj.wsPort] = new Stream(obj).start();
                        }
                        logger.info("b:" + global["video" + "_" + sessionID + "_" + obj.wsPort].server.clients.length);
                    }
                }
            })


        } catch (error) {
            logger.error(error);
        }
    });
});

function getRandom(min, max) {
    return Math.floor(Math.random() * max) + min;
}

function globals() {
    return this;
}

function varsList() {
    return Object.getOwnPropertyNames(globals());
}

/*
檢查PORT是否有被使用
 */
function probe(port, callback) {

    var server = net.createServer().listen(port)

    var calledOnce = false

    var timeoutRef = setTimeout(function () {
        calledOnce = true
        callback(false, port)
    }, 2000)

    timeoutRef.unref()

    var connected = false

    server.on('listening', function () {
        clearTimeout(timeoutRef)

        if (server)
            server.close()

        if (!calledOnce) {
            calledOnce = true
            callback(true, port)
        }
    })

    server.on('error', function (err) {
        clearTimeout(timeoutRef)

        var result = true
        if (err.code === 'EADDRINUSE')
            result = false

        if (!calledOnce) {
            calledOnce = true
            callback(result, port)
        }
    })

}



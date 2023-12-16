//ffmpeg -f h264 -i "http://admin:abcd1234@rtspcameratest.ddns.net:8080/cgi-bin/net_video.cgi?hq=0&audio=1&iframe=1&pframe=1" -b:v 800K -level 3.0 -s 640x360 -start_number 0 -hls_time 10 -hls_list_size 0 -f hls output.m3u8
/*
1.安裝FFMPEG
2.安裝PM2
3.執行pm2 start hls.config.js

 supervisor -g ./source-m3u8,./log,*.html hls.js
 */

let ServerSetting = require("./config.js");
const HLSServer = require('hls-server');
const fs = require("fs");
var log4js = require("log4js");
const http = require('http');
const child_process = require("child_process");
const url = require("url");
let dvrurl = "/cgi-bin/net_video.cgi?hq=0";
let option = {chs: [], host: ServerSetting.host};
let dvrs = [];
log4js.configure({
    appenders: {
        app: {type: 'dateFile', filename: './log/hls', pattern: 'yyyy-MM-dd.log', alwaysIncludePattern: true},
        console: {type: "console"}
    },
    categories: {default: {appenders: ["app", "console"], level: "all"}},
});
var logger = log4js.getLogger('hls');
try {
    fs.readdir('./source-m3u8', function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        files.forEach(function (file) {
            filePath = './source-m3u8/' + file;
            fs.unlinkSync(filePath);
        });
    });
} catch (e) {
}

for (var i = 1; i <= ServerSetting.camerLength; i++) {
    var k = "";
    for (j = 1; j < i; j++) {
        k = k + "0";
    }
    dvrs.push({id: i, wsPort: 6000 + (i * 3), rtspch: "main_0", chname: '', ch: ("1" + k).padStart(8, "0")})
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

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    let html = "";
    try {
        html = fs.readFileSync(__dirname + url.parse(req.url).pathname, "utf8");
    } catch (e) {
        console.log(e)
    }
    res.write(html);
    res.end();
});
const hls = new HLSServer(server, {
    path: '/streams', // Base URI to output HLS streams
    dir: 'source-m3u8', // Directory that input files are stored
});

server.listen(3000);
const io = require("socket.io")(server, {});
let sessionID = "";
io.on("connection", async (socket) => {
    sessionID = socket.id;
    global[ socket.id] = "";
    io.emit("sessionID",  socket.id);
    io.emit("getList", option);
    socket.on("play", function (obj) {
        logger.info(socket.id)
        logger.info(obj)
        //if (sessionID === obj.sessionID) {
            try {
                process.kill(global[socket.id].pid);
            } catch (e) {
            }
            try {
                fs.readdir('./source-m3u8', function (err, files) {
                    if (err) {
                        return console.log('Unable to scan directory: ' + err);
                    }
                    files.forEach(function (file) {
                        if (file.startsWith(obj.sessionID)) {
                            filePath = './source-m3u8/' + file;
                            fs.unlinkSync(filePath);
                        }
                    });
                });

            } catch (e) {

            }
            var filename = "./source-m3u8/" +  socket.id + ".m3u8"
            obj.url = "http://" + ServerSetting.username + ":" + ServerSetting.userpass + "@" + ServerSetting.host + ":" + ServerSetting.port + obj.url

            global[socket.id] = child_process.spawn("ffmpeg", ["-f", "h264", "-i", obj.url, "-profile:v", "baseline", '-b:v', '100K', '-level',
                "3.0", "-s", ServerSetting.videoWidth + 'x' + ServerSetting.videoHeight, "-start_number", 0, "-hls_list_size", 0, "-threads", 4,
                "-force_key_frames", "expr:gte(t,n_forced*1)", "-hls_time", 1, "-preset", "ultrafast", "-an", "-crf", 40, "-f", "hls", filename], {
                detached: false
            });
            var refreshIntervalId = setInterval(function () {
                fs.readFile(filename, function (error, data) {
                    if (error) {
                        logger.info(filename+"------uncomplete");
                        return
                    }
                    io.emit("loadc", {sessionID:  socket.id});
                    clearInterval(refreshIntervalId);
                })
            }, 200)
            var scriptOutput = "";

            global[ socket.id].stdout.setEncoding('utf8');
            global[ socket.id].stdout.on('data', function(data) {
                console.log('stdout: ' + data);

                data=data.toString();
                scriptOutput+=data;
            });

            global[ socket.id].stderr.setEncoding('utf8');
            global[ socket.id].stderr.on('data', function(data) {
                console.log('stderr: ' + data);

                data=data.toString();
                scriptOutput+=data;
            });
        //}
    });
    socket.on("disconnect", function () {
        try {
            process.kill(global[ socket.id].pid);
        } catch (e) {
        }
        try {
            fs.readdir('./source-m3u8', function (err, files) {
                if (err) {
                    return console.log('Unable to scan directory: ' + err);
                }
                files.forEach(function (file) {
                    if (file.startsWith( socket.id)) {
                        filePath = './source-m3u8/' + file;
                        fs.unlinkSync(filePath);
                    }
                });
            });

        } catch (e) {

        }
        global[ socket.id] = null;
    });
});
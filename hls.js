//ffmpeg -f h264 -i "http://admin:abcd1234@rtspcameratest.ddns.net:8080/cgi-bin/net_video.cgi?hq=0&audio=1&iframe=1&pframe=1" -b:v 800K -level 3.0 -s 640x360 -start_number 0 -hls_time 10 -hls_list_size 0 -f hls output.m3u8
/*
執行請看安裝說明

 */

let ServerSetting = require('./config.js');
const convert = require('./Convert2.js');
const path = require('path');
const HLSServer = require('hls-server');
const fs = require('fs');
var log4js = require('log4js');
const http = require('http');
const url = require('url');
let option = {
  chs: [],
  host: ServerSetting.WEB主機.位址,
  port: ServerSetting.WEB主機.PORT,
};
let dvrs = [];
let 轉檔目錄 = ServerSetting.轉檔參數.輸出目錄;
log4js.configure({
  appenders: {
    app: {
      type: 'dateFile',
      filename: './log/hls',
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      daysToKeep: ServerSetting.WEB主機.LOG留存天數,
    },
    console: { type: 'console' },
  },
  categories: { default: { appenders: ['app', 'console'], level: 'all' } },
});
var logger = log4js.getLogger('hls');
exports.logger = logger;
logger.info(__dirname + path.sep + ServerSetting.轉檔參數.輸出目錄);
try {
  fs.readdirSync(__dirname + path.sep + ServerSetting.轉檔參數.輸出目錄 + path.sep).forEach((file) => {
    logger.info(__dirname + path.sep + ServerSetting.轉檔參數.輸出目錄 + path.sep + file);
    fs.unlinkSync(__dirname + path.sep + ServerSetting.轉檔參數.輸出目錄 + path.sep + file);
  });
} catch (e) {
  logger.error(e);
}
logger.info('+');
for (var i = 1; i <= ServerSetting.攝影主機.camerLength; i++) {
  var k = '';
  for (j = 1; j < i; j++) {
    k = k + '0';
  }
  dvrs.push({
    id: i,
    wsPort: 6000 + i * 3,
    rtspch: 'main_0',
    chname: '',
    ch: ('1' + k).padStart(ServerSetting.攝影主機.camerLength, '0'),
  });
}
for (i = 0; i < dvrs.length; i++) {
  //串流啟動參數,&audio=1&iframe=1&pframe=1
  var data = {
    name: dvrs[i].chname,
    ch: dvrs[i].ch,
    url: ServerSetting.攝影主機.APIURI,
    durl: ServerSetting.攝影主機.APIURI,
    width: 640,
    height: 480,
    id: dvrs[i].id,
  };
  option.chs.push(data);
}

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  let html = '';
  try {
    logger.info(__dirname + url.parse(req.url).pathname);
    html = fs.readFileSync(__dirname + url.parse(req.url).pathname, 'utf8');
  } catch (e) {
    //res.status(500).send('Internal server error');
    console.log(e);
  }
  res.write(html);
  res.end();
});
const hls = new HLSServer(server, {
  path: ServerSetting.WEB主機.串流URI, // Base URI to output HLS streams
  dir: 轉檔目錄, // Directory that input files are stored
});

server.listen(ServerSetting.WEB主機.PORT);
const io = require('socket.io')(server, {});
exports.io = io;
let sessionID = '';

io.on('connection', async (socket) => {
  sessionID = socket.id;
  global[socket.id] = '';
  var address = socket.client.conn.remoteAddress.substr(7);
  //logger.info(socket);
  //logger = log4js.getLogger(socket.id);
  logger.info('New connection from ' + socket.id + ':' + address);
  //logger.info("connection by " + socket.id);
  io.emit('sessionID', socket.id);
  io.emit('getList', option);
  socket.on('playch', function (obj) {
    var objJson;
    if (obj !== null && typeof obj === 'object') {
      objJson = obj;
    } else {
      objJson = JSON.parse(obj);
    }

    logger.info(socket.id);
    logger.info(option.chs[parseInt(objJson.ch) - 1]);
    var dvr = option.chs[parseInt(objJson.ch) - 1];
    var playback = '';
    if (objJson.type === '1') {
      //if (撥放時間 != "") {
      var b = Math.floor(objJson.time / 1000);
      playback = '&beg=' + b;
      //}
    }
    var c = dvr.ch;
    dvr.url = dvr.durl + playback + '&audio=' + parseInt(c, 2) + '&iframe=' + parseInt(c, 2) + '&pframe=' + parseInt(c, 2);
    dvr.sessionID = socket.id;
    dvr.ch = obj;
    dvr.username = ServerSetting.攝影主機.username;
    dvr.password = ServerSetting.攝影主機.password;
    convert(socket.id, dvr);
  });
  socket.on('play', function (obj) {
    logger.info(socket.id);
    logger.info(obj);
    convert(socket.id, obj);
  });
  socket.on('disconnect', function () {
    logger.info('disconnect:' + socket.id);
    try {
      process.kill(global[socket.id].pid);
    } catch (e) {}
    try {
      fs.readdirSync(__dirname + path.sep + ServerSetting.轉檔參數.輸出目錄 + path.sep).forEach((file) => {
        logger.info(__dirname + path.sep + ServerSetting.轉檔參數.輸出目錄 + path.sep + file);
        if (file.startsWith(socket.id)) {
          fs.unlinkSync(__dirname + path.sep + ServerSetting.轉檔參數.輸出目錄 + path.sep + file);
        }
      });
    } catch (e) {}
    global[socket.id] = null;
  });
});

module.exports = {
  io: io,
  logger: logger,
};

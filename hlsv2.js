let ServerSetting = require('./config.js');
const convert = require('./Convert2.js');
const path = require('path');
const HLSServer = require('hls-server');
const fs = require('fs');
var log4js = require('log4js');
const http = require('http');
const url = require('url');
let dvrs = [];
log4js.configure({
    appenders: {
        app: {
            type: 'dateFile',
            filename: './log/hls',
            pattern: 'yyyy-MM-dd.log',
            alwaysIncludePattern: true,
            backups: ServerSetting.WEB主機.LOG留存天數,
        },
        console: {type: 'console'},
    },
    categories: {default: {appenders: ['app', 'console'], level: 'all'}},
});
var logger = log4js.getLogger('hls');
exports.logger = logger;
try {
    fs.readdirSync(__dirname + path.sep + ServerSetting.轉檔參數.輸出目錄 + path.sep).forEach((file) => {
        logger.info(__dirname + path.sep + ServerSetting.轉檔參數.輸出目錄 + path.sep + file);
        fs.unlinkSync(__dirname + path.sep + ServerSetting.轉檔參數.輸出目錄 + path.sep + file);
    });
} catch (e) {
    logger.error(e);
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
    dir: ServerSetting.轉檔參數.輸出目錄, // Directory that input files are stored
});

server.listen(ServerSetting.WEB主機.PORT);
const io = require('socket.io')(server, {});
exports.io = io;
let sessionID = '';


io.on('connection', async (socket) => {
    sessionID = socket.id;
    global[socket.id] = '';
    var address = socket.client.conn.remoteAddress.substr(7);

    logger.info('New connection from ' + socket.id + ':' + address);
    io.emit('sessionID', socket.id);
    io.emit('getList', ServerSetting);

    socket.on('play', function (obj) {
        logger.info(socket.id);
        logger.info(obj);
        try {
            process.kill(global[socket.id].pid);
        } catch (e) {
        }
        try {
            fs.readdirSync(__dirname + path.sep + ServerSetting.轉檔參數.輸出目錄 + path.sep).forEach((file) => {
                if (file.startsWith(socket.id)) {
                    fs.unlinkSync(__dirname + path.sep + ServerSetting.轉檔參數.輸出目錄 + path.sep + file);
                }
            });
        } catch (e) {
        }
        global[socket.id] = null;
        convert(socket.id, obj);

    });
    socket.on('disconnect', function () {
        logger.info('disconnect:' + socket.id);
        try {
            process.kill(global[socket.id].pid);
        } catch (e) {
        }
        try {
            fs.readdirSync(__dirname + path.sep + ServerSetting.轉檔參數.輸出目錄 + path.sep).forEach((file) => {
                logger.info(__dirname + path.sep + ServerSetting.轉檔參數.輸出目錄 + path.sep + file);
                if (file.startsWith(socket.id)) {
                    fs.unlinkSync(__dirname + path.sep + ServerSetting.轉檔參數.輸出目錄 + path.sep + file);
                }
            });
        } catch (e) {
        }
        global[socket.id] = null;
    });
});

module.exports = {
    io: io,
    logger: logger,
};


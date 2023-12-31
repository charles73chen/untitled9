let ServerSetting = require('./config.js');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');
const hls = require('./hls.js');
function 轉檔(id, dvr) {
  try {
    process.kill(global[id].pid);
  } catch (e) {}
  try {
    fs.readdirSync(__dirname + path.sep + ServerSetting.轉檔參數.輸出目錄 + path.sep).forEach((file) => {
      //logger.info(__dirname + path.sep + ServerSetting.轉檔參數.輸出目錄 + path.sep + file);
      if (err) {
        fs.promises.mkdir(__dirname + path.sep + ServerSetting.轉檔參數.輸出目錄, { recursive: true });
        return console.log('Unable to scan directory: ' + err);
      }
      if (file.startsWith(dvr.sessionID)) {
        fs.unlinkSync(__dirname + path.sep + ServerSetting.轉檔參數.輸出目錄 + path.sep + file);
      }
    });
  } catch (e) {}
  hls.logger.info(dvr);
  var filename = __dirname + path.sep + ServerSetting.轉檔參數.輸出目錄 + path.sep + id + '.m3u8';
  dvr.url = `http://${dvr.username}:${dvr.password}@${ServerSetting.攝影主機.位址}:${ServerSetting.攝影主機.PORT}${dvr.url}`;
  dvr.text = `[in]drawtext=fontfile=AGENCYB.TTF:fontsize=${ServerSetting.轉檔參數.浮水印.左上字體尺寸}:fontcolor=White:text=${ServerSetting.轉檔參數.浮水印.左上頻道} ${String(dvr.ch).padStart(2, '0')}:x=20:y=50,drawtext=fontfile=mingliu.ttc:fontsize=${
    ServerSetting.轉檔參數.浮水印.右下字體尺寸
  }:fontcolor=yellow:text=${ServerSetting.轉檔參數.浮水印.右下}:x=w-tw:y=h-th[out]`;
  global[id] = child_process.spawn(
    'ffmpeg',
    [
      '-f',
      'h264',
      '-i',
      dvr.url,
      '-profile:v',
      'baseline',
      '-b:v',
      ServerSetting.轉檔參數.解柝度,
      '-level',
      '3.0',
      '-s',
      ServerSetting.轉檔參數.videoWidth + 'x' + ServerSetting.轉檔參數.videoHeight,
      '-start_number',
      0,
      '-hls_list_size',
      0,
      '-threads',
      ServerSetting.轉檔參數.線程,
      '-force_key_frames',
      'expr:gte(t,n_forced*1)',
      '-hls_time',
      1,
      '-preset',
      ServerSetting.轉檔參數.轉檔速度.快,
      '-an',
      '-crf',
      30,
      '-vf',
      dvr.text,
      '-f',
      'hls',
      filename,
    ],
    {
      detached: false,
    }
  );
  var start = new Date();
  var refreshIntervalId = setInterval(function () {
    fs.readFile(filename, function (error, data) {
      var diff = new Date().getTime() - start.getTime();
      if (diff / 1000 > ServerSetting.影片連線逾時秒數) {
        hls.io.emit('loaderror', { msg: 'error', sessionID: id });
        clearInterval(refreshIntervalId);
      }

      if (error) {
        hls.logger.info(filename + '------uncomplete');
        return;
      }
      hls.io.emit('loadc', {
        sessionID: id,
        host: ServerSetting.WEB主機.位址,
        port: ServerSetting.WEB主機.PORT,
      });
      clearInterval(refreshIntervalId);
    });
  }, 200);
  //var scriptOutput = "";
  global[id].stdout.setEncoding('utf8');
  global[id].stdout.on('data', function (data) {
    hls.logger.info(data);
  });

  global[id].stderr.setEncoding('utf8');
  global[id].stderr.on('data', function (data) {
    hls.logger.info(data);
  });
}
module.exports = 轉檔;

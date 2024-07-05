const os = require('os');
const ServerSetting = {
  攝影主機: [{
    主機名稱:'192.168.1.110',
    camerLength: 32, //頻道數量
    位址: '192.168.1.110',
    PORT: 80,
    username: 'admin', //攝影主機登入帳號
    userpass: 'abcd1234', //攝影主機登入密碼
    APIURI: '/cgi-bin/net_video.cgi?hq=0',
  },{
    主機名稱:'192.168.1.109',
    camerLength: 32, //頻道數量
    位址: '192.168.1.109',
    PORT: 80,
    username: 'admin', //攝影主機登入帳號
    userpass: 'abcd1234', //攝影主機登入密碼
    APIURI: '/cgi-bin/net_video.cgi?hq=0',
  }], //攝影主機
  WEB主機: {
    位址: 'c1b69b2.i-dvr.net',
    PORT: 3002,
    串流URI: '/streams',
    LOG留存天數: 90,
  }, //WEB主機

  需要浮水印: true, //尚未使用
  轉檔參數: {
    輸出目錄: 'source-m3u8',
    videoWidth: 640, //轉出檔案寬
    videoHeight: 360, //轉出檔案高
    解柝度: '1200K',
    轉檔速度: {
      快: 'ultrafast',
      中: 'medium',
      慢: 'veryslow',
    },
    浮水印: {
      左上頻道: 'CH',
      左上字體尺寸: 80,
      右下: '浮水印',
      右下字體尺寸: 40,
    }, //右下角水印字樣
    線程: os.cpus().length, //轉檔使用多少CPU核心
  },
  影片連線逾時秒數: 30,
};

module.exports = ServerSetting;

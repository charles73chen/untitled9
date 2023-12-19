const os = require("os");
const ServerSetting = {
    host: "rtspcameratest.ddns.net",//WEB主機位址
    攝影主機:"192.168.1.113",//攝影主機位址
    攝影主機PORT:80,//攝影主機位址使用PORT
    serverPort:3000,//WEB主機PORT
    username: "admin",//攝影主機登入帳號
    userpass: "abcd1234",//攝影主機登入密碼
    videoWidth: 640,//轉出檔案寬
    videoHeight: 360,//轉出檔案高
    camerLength: 32,//頻道數量
    線程: os.cpus().length,//轉檔使用多少CPU核心
    浮水印:"浮水印",//右下角水印字樣
    連線逾時秒數:30
}

module.exports = ServerSetting;
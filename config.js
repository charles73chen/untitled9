const os = require("os");
const ServerSetting = {
    攝影主機:{
        camerLength: 32,//頻道數量
        位址:"192.168.1.113",
        PORT:80,
        username: "admin",//攝影主機登入帳號
        userpass: "abcd1234",//攝影主機登入密碼
    },//攝影主機
    WEB主機:{
        位址:"rtspcameratest.ddns.net",
        PORT:3000
    },//WEB主機
    
    需要浮水印:true,
    轉檔參數:{
        輸出目錄:"source-m3u8",
        videoWidth: 640,//轉出檔案寬
        videoHeight: 360,//轉出檔案高
        解柝度:"100K",
        轉檔速度:{
            快:"ultrafast",
            中:"medium",
            慢:"veryslow",
        },
        浮水印:{
            左上頻道:"CH",
            左上字體尺寸:80,
            右下:"浮水印",
            右下字體尺寸:40
        },//右下角水印字樣
        線程: os.cpus().length,//轉檔使用多少CPU核心
    },
    連線逾時秒數:30
}

module.exports = ServerSetting;
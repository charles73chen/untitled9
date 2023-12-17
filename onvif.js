const onvif = require('node-onvif');
var log4js = require("log4js");
const EventEmitter = require("events");
log4js.configure({
    appenders: {
        app: {type: 'dateFile', filename: './log/rtsp', pattern: 'yyyy-MM-dd.log', alwaysIncludePattern: true},
        console: {type: "console"}
    },
    categories: {default: {appenders: ["app", "console"], level: "all"}},
});
var logger = log4js.getLogger('onvif');

class Onvif extends EventEmitter {
    getONVIFDevice() {
        logger.info('Start the discovery process.');
        onvif.startProbe().then(async (device_info_list) => {
            logger.info(device_info_list.length + ' devices were found.');
            // Show the device name and the URL of the end point.
            let i = 1;
            await device_info_list.forEach((info) => {
                //logger.info(info);
                var t = i;
                var k = "";
                for (var j = 1; j < i; j++) {
                    k = k + "0";
                }
                dvrs.push({id: i, wsPort: 6000 + (i * 3), rtspch: "main_0", chname: info.hardware, ch: ("1" + k).padStart(8, "0")})
                i++;

            });
            //logger.info(dvrs)
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
            if(dvrs.length==0)
                getONVIFDevice();
        }).catch((error) => {
            console.error(error);
        });
    }
}

module.exports = Onvif
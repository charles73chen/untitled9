const os = require("os");
const ServerSetting = {
    host: "rtspcameratest.ddns.net",
    port: 8080,
    攝影主機:"192.168.1.113",
    攝影主機PORT:80,
    serverPort:3000,
    username: "admin",
    userpass: "abcd1234",
    videoWidth: 640,
    videoHeight: 360,
    camerLength: 32,
    線程: os.cpus().length
}

module.exports = ServerSetting;
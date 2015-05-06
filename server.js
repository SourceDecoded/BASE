var express = require('express');
var https = require('https');
var url = require("url");
var util = require("util");

var app = express();

//app.use(express.bodyParser());

var port = 8080;
var ipaddress = "localhost";

var findLocalIP = function () {
    var os = require('os');
    var ifaces = os.networkInterfaces();
    var ipv4Addrs = [];
    for (var dev in ifaces) {
        ifaces[dev].forEach(function (details) {
            if (details.family == 'IPv4') {
                ipv4Addrs.push(details.address);
            }
        });
    }

    var tenAddrs = ipv4Addrs.filter(function (addr) {
        return addr.indexOf("10") === 0;
    });
    
    var returnAddr = tenAddrs.length > 0 ? tenAddrs[0] : ipv4Addrs[0];
    return returnAddr || "localhost";
};

var webapiHandler = function (req, res) {
    var parts = url.parse(req.url);
    var path = parts.pathname.replace(/^\/webapi/, "");
    if (parts.search) {
        path += parts.search;
    }
    var headers = req.headers;
    headers.host = "api.leavitt.com";
    var options = {
        host: "api.leavitt.com",
        method: req.method,
        path: path,
        headers: headers,
        port: 443,
        rejectUnauthorized: false
    };

    console.log("Proxying " + path + " to https://" + options.host + ":" + options.port + options.path);

    var proxyReq = https.request(options, function (proxyRes) {
        res.statusCode = proxyRes.statusCode;
        proxyRes.on("data", function (chunk) {
            res.write(chunk);
        });
        proxyRes.on("end", function () {
            res.end();
        });
    });

    req.on("data", function (chunk) {
        proxyReq.write(chunk);
    });

    req.on("end", function () {
        proxyReq.end();
    });
    
};

app.get("/webapi/*", webapiHandler);
app.post("/webapi/*", webapiHandler);
app.patch("/webapi/*", webapiHandler);
app.delete("/webapi/*", webapiHandler);

app.use(express["static"](__dirname));
if (process.argv.length === 4) {
    ipaddress = process.argv[2];
    port = process.argv[3];
} else if (process.argv.length === 3) {
    ipaddress = process.argv[2];
} else {
    ipaddress = findLocalIP();
}
app.listen(port, ipaddress, function () {
    console.log("%s:%d", ipaddress, port);
});
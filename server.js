var unirest = require("unirest");
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var getTokenAsync = require('dyn365-access-token').default;
var path = require('path');
var fs = require('fs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8085;

var router = express.Router();

router.get('/', function (req, res) { handleRequest("GET", req, res) });
router.post('/', function (req, res) { handleRequest("POST", req, res) });
router.delete('/', function (req, res) { handleRequest("DELETE", req, res) });
router.put('/', function (req, res) { handleRequest("PUT", req, res) });
router.patch('/', function (req, res) { handleRequest("PATCH", req, res) });

function handleRequest(method, req, res) {
    readConfig().then((config) => {
        var options = {
            username: config.username,
            password: config.password,
            client_id: config.clientid,
            client_secret: config.clientsecret,
            resource: config.resource,
            commonAuthority: config.commonAuthority,
        }

        getTokenAsync(options).then(function (token) {
            proxy(token, method, req.originalUrl, config.resource, req).then((response) => {
                var json = response.body;
                res.setHeader('Content-Type', 'application/json');


                res.status(response.code);
                res.send(JSON.stringify(json));
            }).catch((response) => {
                console.log(response.error);
                if (response.error)
                    res.status(response.error.status);
                else
                    res.status(400)

                if (response.body && response.body.error && response.body.error.innererror)
                    res.send(response.body.error.innererror);
                else res.send(response.body)
            });
        });
    });
}

function readConfig() {
    return new Promise((resolve, reject) => {
        var sourcepath = path.dirname(process.cwd()) + '\\' + path.basename(process.cwd()) + '\\.crmdeployconfig';
        
        console.log(sourcepath)

        var file = fs.readFile(sourcepath, 'utf8', (err, data) => {
            var cfg = JSON.parse(data);
            cfg.root = path.dirname(process.cwd()) + '\\' + path.basename(process.cwd());
            resolve(cfg);
        });
    })
}

function proxy(token, method, path, resource, inrequest) {
    return new Promise((resolve, reject) => {
        var req = unirest(method, resource + path);


        var headers = {
            "content-type": "application/json",
            "accept": "application/json",
            "authorization": "Bearer " + token
        }

        if (inrequest.headers['prefer'] === "return=representation")
            headers['prefer'] = "return=representation"

        req.headers(headers);

        req.type("json");

        req.send(inrequest.body);

        req.end(function (res) {
            if (res.error) {
                reject(res)
                return;
            };

            console.log(res.body);

            resolve(res);
        });

    });
}


app.use('/api', router);
app.use('/api*', router);


app.listen(port);

console.log('crm-proxy running on port ' + port);

var cheerio = require('cheerio');
var request = require('request');
var express = require('express');
var app = express();
function generateView(data) {
	var arr=[];
    var ret = '<html><title>List Items</title><ul>';
    for (var i = 0; i < data.length; i++) {
		arr =  data[i].url.split('?');
        ret += '<li><b>' +arr[0] + '</b> --' + data[i].title + '</li>';
    }
    return ret + '</ul></html>';
}

function getData(response, html) {
    var $ = cheerio.load(html),res = {};
    res = {
            'url': response.request.href,
            'title': $('title').html()
        }
    return res;
}
function SendRequest (url, cb) {

    request({
        uri: url
    }, function (error, response, body) {
        if (!error) {
            cb(null, getData(response, body));
        } else {
            cb(error);
        }
    });
}
function ChkUrl(param) {
    var addressesArr = [];
    if (typeof(param.address) === 'string') {
        var str=param.address;
        if (  str.indexOf('https://') === -1 &&   str.indexOf('http://') === -1) {
            str = 'http://' + str;
        }
        addressesArr.push(str);
    } else {
        addressesArr = addressesArr.concat(param.address);
    }
    return addressesArr;
}

app.get('/I/want/title', function (request, resonse) {

    if (!request.query.address) {
        resonse.send('<h1>No Address Found</h1>')
    } else {
        var Alladdresses =   ChkUrl(request.query);
        var records = [],counter = Alladdresses.length;
        for (var i = 0; i < Alladdresses.length; i++) {
            SendRequest(Alladdresses[i], function (err, result) {
                if (!err) {records.push(result);} 
                 resonse.writeHead(200, {'Content-Type': 'text/plain'});
	resonse.end(generateView(records)); 
            });
        }
    }
});
app.get('*', function(request, resonse) {
    resonse.send('<h1>404 Page Not Found</h1>');
});
var server = app.listen(process.env.PORT || 3000);
module.exports = server;

var cheerio = require('cheerio');
var request = require('request');
var express = require('express');
var app = express();

var q = require('q');

function prepareUrl(param) {
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

function buildHtml(data) {
    var ret = '<html><title>List Items</title><ul>';
    for (var i = 0; i < data.length; i++) {
        ret += '<li><b>' + data[i].url + '</b> --> <span>' + data[i].title + '</span></li>';
    }
    return ret + '</ul></html>';
}

function getTitle(response, html) {
    var $ = cheerio.load(html),res = {};
    res = {
            'url': response.request.href,
            'title': $('title').html()
        }
    return res;
}
function entryPoint(urlList) {
    var defer = q.defer();
    var titleList = [];
    var counter = urlList.length;
    for (var i = 0; i < urlList.length; i++) {
        makeRequest(urlList[i], function (error, results) {
            if (error) {
                defer.reject(error);
            } else {
                titleList.push(results);
                if (counter === i) {
                    defer.resolve(titleList);
                }
            }
        });
    }

    return defer.promise;
}

function makeRequest (url, cb) {
    request({
        uri: url
    }, function (error, response, body) {
        if (!error) {
            cb(null, getTitle(response, body));
        } else {
            cb(error);
        }
    });
}


// Handle request
app.get('/I/want/title', function (req, res) {

    if (!req.query.address) {
        res.send('<h1>No Titles Found</h1>')
    } else {
        // Get addresses array out of query params
        var addresses =  prepareUrl(req.query);
        entryPoint(addresses).then(function (titleList) {
            res.send( buildHtml(titleList));
        })
    }
});

app.get('*', function(req, res) {
    res.status(404).send('<h1>404 Not Found</h1>');
});

var server = app.listen(process.env.PORT || 3000);

module.exports = server;
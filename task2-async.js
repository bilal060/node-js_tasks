var cheerio = require('cheerio');
var request = require('request');
var express = require('express');
var async = require('async');
var app = express();
function generateView(data) {
    var ret = '<html><title>List Items</title><ul>';
	
    for (var i = 0; i < data[0].length; i++) {
		var arr=[];
        if(data[0]){
			if(data[0][i]){
				arr =  data[0][i].url.split('?');
				ret += '<li><b>' + arr[0] + '</b>     --       ' + data[0][i].title + '</li>';

			}
		}
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
    var titleList = [];
    request({
        uri: url
    }, function (error, response, body) {
        console.log(getData(response, body));
        if (!error) {
            titleList.push(getData(response, body));
           cb(null,titleList);
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

app.get('/I/want/title', function (request, response) {

    if (!request.query.address) {
        response.send('<h1>No Address Found</h1>')
    } else {
        var Alladdresses =   ChkUrl(request.query);
         if(Alladdresses[0].indexOf('.') === -1){
             response.send('<h1>Invalid Address</h1>')
         }else{
            var counter = Alladdresses.length;
            async.map(Alladdresses,SendRequest, function (err, result) {
                if(err){
                     response.status(404).send('<h1>404 Page Not Found</h1>');
                }
                response.writeHead(200, {'Content-Type': 'text/plain'});
	response.end(generateView(records));          
            });
    }
        
    }
});
app.get('*', function(request, response) {
    response.status(404).send('<h1>404 Page Not Found</h1>');
});
var server = app.listen(process.env.PORT || 3000);
module.exports = server;

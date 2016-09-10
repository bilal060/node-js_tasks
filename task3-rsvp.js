var cheerio = require('cheerio');
var request = require('request');
var express = require('express');
var rsvp = require('rsvp');
var app = express();

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

function generateView(data) {
    var ret = '<html><title>List Items</title><ul>';
	
    for (var i = 0; i < data.length; i++) {
		var arr=[];
        if(data){
			if(data[i]){
				arr =  data[i].url.split('?');
				ret += '<li><b>' + arr[0] + '</b>     --       ' + data[i].title + '</li>';

			}
		}
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
    
resolve("Stuff not worked!");
   // return defer.promise;
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
        res.send('<h1>No Address Found</h1>')
    } else {
        // Get addresses array out of query params
        var addresses =  ChkUrl(req.query);
        var promise = new Promise(function(resolve, reject) {
        var titleList = [];
        var counter = addresses.length;
        for (var i = 0; i < addresses.length; i++) {
            makeRequest(addresses[i], function (error, results) {
                if (error) {
                    reject(Error("Error Page not Found"));
                } else {
                    titleList.push(results);
                    if (counter === i) {
                        resolve(titleList);
                        }
                    }
                });
            }


        });
        promise.then(function(result) {
            
          res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end(generateView(records));
        }, function(err) {
           res.send( err);
        });
      
    }
});

app.get('*', function(req, res) {
    res.status(404).send('<h1>404 Not Found</h1>');
});

var server = app.listen(process.env.PORT || 3000);

module.exports = server;

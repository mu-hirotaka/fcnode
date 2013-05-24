
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , settings = require('./oauth_settings');

var app = express();
var server = http.createServer(app);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var twitter = require('ntwitter');
var io = require('socket.io').listen(server);
var tw = new twitter(settings);

var keyword = "サッカー";
app.get('/', function(req, res) {
	if (req.query.keyword) {
		keyword = req.query.keyword;
	}
	res.render('index', {
		keyword: keyword
	});

	tw.stream('statuses/filter', { 'track': keyword }, function (stream) {
//	tw.stream('statuses/filter', {'track': keyword, 'locations':'122.87,24.84,153.01,46.80'}, function (stream) {
		stream.on('data', function(data) {
			io.sockets.emit('message', data.text);
		});
		stream.on('end', function(response) {

			console.log("end");
		});
		stream.on('destroy', function(response) {
			console.log("destroy");

		});
		stream.on('error', function(error, code) {
			console.log("my error:" + error + ":" + code);
		});
	});
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

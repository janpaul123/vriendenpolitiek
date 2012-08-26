/*jshint node:true*/
"use strict";

var options = {
	port: process.env.PORT || 3000,
	assets: __dirname + '/assets',
	staticOptions: {
		maxAge: 10*60*1000
	},
	browserify: {
		entry: __dirname + '/index.js',
		debug: true
	},
	less: {
		src: __dirname + '',
		dest: __dirname + '/assets'
	},
	logs: {
		requests: true
	}
};

console.log('Dev webserver loaded');

var connect = require('connect');
var lessMiddleware = require('less-middleware');
var browserify = require('browserify');

var app = connect();
if (options.logs.requests) app.use(connect.logger('tiny'));

app.use(lessMiddleware(options.less))
	.use(connect.favicon(__dirname + '/assets/favicon.ico'))
	.use(browserify(options.browserify))
	.use('', function(req, res, next) {
		if(req.url.indexOf('/home') === 0 || req.url.indexOf('/full') === 0) req.url = '/';
		next();
	})
	.use(connect['static'](options.assets, options.staticOptions))
	.listen(options.port);

/*jshint node:true*/
"use strict";

var options = {
	port: process.env.PORT || 3000,
	assets: __dirname + '/assets',
	browserify: {
		entry: __dirname + '/index.js',
		debug: true,
		watch: true
	},
	less: {
		src: __dirname + '',
		dest: __dirname + '/assets',
		debug: true,
		once: false,
		compress: false,
		optimization: 0
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

var noCache = function(req, res, next) {
	res.on('header', function(header) {
		res.setHeader('Cache-Control', 'private, max-age=0');
		res.setHeader('Expires', 'Thu, 01 Jan 1970 00:00:00 GMT');
		res.setHeader('Pragma', 'no-cache');
	});
	next();
};

app.use(noCache)
	.use(lessMiddleware(options.less))
	.use(connect.favicon(__dirname + '/assets/favicon.ico'))
	.use(connect['static'](options.assets))
	.use(browserify(options.browserify))
	.listen(options.port);

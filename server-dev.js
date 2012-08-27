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

app.use(lessMiddleware(options.less))
	.use(connect.favicon(__dirname + '/assets/favicon.ico'))
	.use(connect['static'](options.assets, options.staticOptions))
	.use(browserify(options.browserify))
	.listen(options.port);

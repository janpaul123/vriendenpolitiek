all: assets

# assets
assets: assets/js/browser.js assets/css/style.css

assets/js/browser.js: browser.js
	cp browser.js assets/js/browser.js

assets/css/style.css: style.css
	cp style.css assets/css/style.css

browser.js: *.js */*.js data.js
	node_modules/.bin/browserify cli-assets.js -d -o browser.js

style.css: cli-assets.less *.less */*.less bootstrap/less/*.less
	node_modules/.bin/lessc cli-assets.less > style.css

data.js:
	node convert.js > data.js

.PHONY: all assets
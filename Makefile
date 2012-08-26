all: assets

# assets
assets: assets/browserify.js assets/index.css

assets/browserify.js: index.js client.js data.js clayer/*.js
	node_modules/.bin/browserify index.js -d -o assets/browserify.js

assets/index.css: index.less bootstrap/less/*.less clayer/*.less
	node_modules/.bin/lessc index.less > assets/index.css

data.js: convert.js Stemmingen.tsv
	node convert.js > data.js

.PHONY: all assets
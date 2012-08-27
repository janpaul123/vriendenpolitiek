all: assets/data.js data.js images

# assets
# assets: assets/browserify.js assets/index.css images assets/data.js

# assets/browserify.js: index.js client.js data.js clayer/*.js
	# node_modules/.bin/browserify index.js -d -o assets/browserify.js

# assets/index.css: index.less bootstrap/less/*.less clayer/*.less
	# node_modules/.bin/lessc index.less > assets/index.css

assets/data.js: data.js
	cp data.js assets/data.js

data.js: convert.js Stemmingen.tsv
	node convert.js > data.js

images: imgspartijen/*
	cd imgspartijen; for image in *; do echo $${image}; /ImageMagick-6.7.9/bin/convert $${image} -resize 240x90 ../assets/img/$${image%.*}.png; done

.PHONY: all assets images
.DEFAULT: clean build
.PHONY: clean distclean

css = ./node_modules/.bin/lessc $< $@ && ./node_modules/.bin/autoprefixer $@

build: \
	setup \
	sliders.js \
	sliders.min.js \
	css \

clean:
	rm -rf sliders.js sliders.min.js css

lib:
	mkdir lib

css/themes:
	mkdir -p css/themes

distclean: clean
	rm -f lib/compiler.jar lib/jquery-1.8-extern.js

css/sliders.css: less/sliders.less

setup: \
	lib \
	lib/jquery-1.8-extern.js \
	lib/compiler.jar \
	css/themes \
	node_modules/.bin/lessc \
	node_modules/.bin/autoprefixer \

lib/jquery-1.8-extern.js:
	wget -O $@ http://closure-compiler.googlecode.com/svn/trunk/contrib/externs/jquery-1.8.js

lib/compiler.jar:
	wget -O- http://dl.google.com/closure-compiler/compiler-latest.tar.gz | tar -xz -C lib compiler.jar

node_modules/.bin/lessc:
	npm install less

node_modules/.bin/autoprefixer:
	npm install autoprefixer

sliders.js: js/Sliders.js js/wrap.js
	sed -e "/<<Sliders>>/r js/Sliders.js" -e "/<<Sliders>>/d" js/wrap.js > sliders.js

sliders.min.js: sliders.js
	java -jar lib/compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS --externs lib/jquery-1.8-extern.js < $< > $@

css: \
	css/sliders.css \
	css/themes/sliders-light.css \
	css/themes/sliders-dark.css \
	css/themes/sliders-iphone.css \
	css/themes/sliders-modern.css \
	css/themes/sliders-all.css \
	css/sliders-full.css \

css/sliders.css: less/sliders.less
	$(call css)

css/sliders-full.css: css/sliders.css css/themes/sliders-all.css
	cat $^ > $@

css/themes/sliders-all.css: css/themes/sliders-light.css css/themes/sliders-dark.css css/themes/sliders-iphone.css css/themes/sliders-modern.css css/themes/sliders-soft.css
	cat $^ > $@

css/themes/sliders-light.css: less/themes/sliders-light.less
	$(call css)

css/themes/sliders-dark.css: less/themes/sliders-dark.less
	$(call css)

css/themes/sliders-iphone.css: less/themes/sliders-iphone.less
	$(call css)

css/themes/sliders-modern.css: less/themes/sliders-modern.less
	$(call css)

css/themes/sliders-soft.css: less/themes/sliders-soft.less
	$(call css)


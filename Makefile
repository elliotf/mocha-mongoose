testwatch:
	./node_modules/.bin/nodemon -L -d 0 -w . --exec make test

test:
	./node_modules/.bin/mocha --recursive --reporter list test/index.js
	./node_modules/.bin/mocha --recursive --reporter list example/test.js
	./node_modules/.bin/mocha --recursive --reporter list example/manual.js

clean:
	rm -rf node_modules

install:
	npm install

.PHONY: clean install test testwatch

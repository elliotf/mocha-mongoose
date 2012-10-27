testwatch:
	./node_modules/.bin/nodemon -L -d 0 -w . --exec make test

test:
	./node_modules/.bin/mocha --recursive --reporter list -C test/index.js && ./node_modules/.bin/mocha --recursive --reporter list -C example/test.js

clean:
	rm -rf node_modules

install:
	npm install

.PHONY: clean install test testwatch

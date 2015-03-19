mocha-mongoose
==============

Test helpers for using mongoose with mocha.

See the example spec (copied below) for more details.

[![Travis-CI Build Status](https://secure.travis-ci.org/elliotf/mocha-mongoose.png)](http://travis-ci.org/elliotf/mocha-mongoose)
[![Drone.io Build Status](https://drone.io/github.com/elliotf/mocha-mongoose/status.png)](https://drone.io/github.com/elliotf/mocha-mongoose/latest)

## Installation

Install via npm:
```bash
npm install mocha-mongoose --save-dev
```
Either require mocha-mongoose in your spec helper (easier) or in each spec file:

*Via spec helper*

mocha.opts:
```bash
--require ./test/common.js
--reporter spec
--ui bdd
--recursive
--colors
--timeout 60000
--slow 300
```
common.js:
```javascript
require('mocha-mongoose')('mongodb://your-mongodb-url-here');
```
*Via each spec file*

test.js
```javascript
var should = require('chai').should()
  , require('mocha-mongoose')('mongodb://your-mongodb-url-here');

describe("Example test", function() {
    it(' Mongo will be automatically clear all collections',);
});
```

#####Now mocha-mongoose will automatically clear all of your collections before each spec run.

## Example usage of automatically clearing the DB between specs:

This is a copy of example/test.js

```javascript
var dbURI    = 'mongodb://localhost/demo-app-clearing-db'
  , should   = require('chai').should()
  , mongoose = require('mongoose')
  , Dummy    = mongoose.model('Dummy', new mongoose.Schema({a:Number}))
  // just requiring  require('mocha-mongoose')(dbURI) allows mocha-mongoose 
  // to clear DB between tests. We only set it to clearDB here, so that we can
  // clear the DB on demand later. 
  , clearDB  = require('mocha-mongoose')(dbURI) 
;

describe("Example spec for a model", function() {
  // This ensures that mongoose is connected. It can be avoided
  // If you're doing it elsewhere in your application
  beforeEach(function(done) {
    if (mongoose.connection.db) return done();

    mongoose.connect(dbURI, done);
  });

  it("can be saved", function(done) {
    new Dummy({a: 1}).save(done);
  });

  it("can be listed", function(done) {
    new Dummy({a: 1}).save(function(err, model){
      if (err) return done(err);

      new Dummy({a: 2}).save(function(err, model){
        if (err) return done(err);

        Dummy.find({}, function(err, docs){
          if (err) return done(err);

          // without clearing the DB between specs, this would be 3
          docs.length.should.equal(2);
          done();
        });
      });
    });
  });

  it("can clear the DB on demand", function(done) {
    new Dummy({a: 5}).save(function(err, model){
      if (err) return done(err);

      clearDB(function(err){
        if (err) return done(err);

        Dummy.find({}, function(err, docs){
          if (err) return done(err);

          console.log(docs);

          docs.length.should.equal(0);
          done();
        });
      });
    });
  });
});
```
## Example usage of manually clearing the DB:

This is a copy of example/manual.js

```javascript
var dbURI    = 'mongodb://localhost/demo-app-clearing-db'
  , expect   = require('chai').expect
  , mongoose = require('mongoose')
  , Dummy    = mongoose.model('Dummy', new mongoose.Schema({a:Number}))
  , clearDB  = require('mocha-mongoose')(dbURI, {noClear: true})
;

describe("Example spec for a model", function() {
  before(function(done) {
    if (mongoose.connection.db) return done();

    mongoose.connect(dbURI, done);
  });

  before(function(done) {
    clearDB(done);
  });

  it("can be saved", function(done) {
    Dummy.create({a: 1}, done);
  });

  it("can save another", function(done) {
    Dummy.create({a: 2}, done);
  });

  it("can be listed", function(done) {
     Dummy.find({}, function(err, models){
      expect(err).to.not.exist;
      expect(models).to.have.length(2);

      done();
     });
  });

  it("can clear the DB on demand", function(done) {
    Dummy.count(function(err, count){
      expect(err).to.not.exist;
      expect(count).to.equal(2);

      clearDB(function(err){
        expect(err).to.not.exist;

        Dummy.find({}, function(err, docs){
          expect(err).to.not.exist;

          expect(docs.length).to.equal(0);
          done();
        });
      });
    });
  });
});
```

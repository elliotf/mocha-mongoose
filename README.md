mocha-mongoose
==============

test helpers for using mongoose with mocha.

See the example spec (copied below) for more details.

[![Build Status](https://secure.travis-ci.org/elliotf/mocha-mongoose.png)](http://travis-ci.org/elliotf/mocha-mongoose)

## Installation

    $ npm install mocha-mongoose

## Example usage of automatically clearing the DB between specs:

This is a copy of example/test.js

    var dbURI    = 'mongodb://localhost/demo-app-clearing-db'
      , should   = require('chai').should()
      , mongoose = require('mongoose')
      , Dummy    = mongoose.model('Dummy', new mongoose.Schema({a:Number}))
      , clearDB  = require('mocha-mongoose')(dbURI)
    ;

    describe("Example spec for a model", function() {
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

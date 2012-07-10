mocha-mongoose
==============

test helpers for using mongoose with mocha

## Installation

    $ npm install mocha-mongoose

## Example:

    require('mocha-mongoose');
    var mongoose = require('mongoose');
    var should = require('should');

    var Dummy = mongoose.model('Dummy', new mongoose.Schema({a:Number}));

    describe("before hook", function() {
      var id;

      it("auto-connects to the DB if necessary", function(done) {
        should.exist(mongoose.connection.db);

        var dummy = new Dummy({a: 1})
        dummy.save(function(err){
          if (err) return done(err);

          should.exist(dummy.id);

          Dummy.findById(dummy.id, function(err, doc){
            if (err) return done(err);
            should.exist(doc);
            done();
          });
        });
      });

      it("empties the DB between specs", function(done) {
        Dummy.find({}, function(err, docs){
          if (err) return done(err);
          docs.length.should.equal(0);
          done();
        });
      });
    });

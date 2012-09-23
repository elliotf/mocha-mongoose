// make it extremely unlikely that this test unintentionally drops someone's DB
var uniqueId = 'c90b6960-0109-11e2-9595-00248c45df8a'
  , dbURI    = 'mongodb://localhost/mongodb-wiper-test-' + uniqueId
  , cleaner  = require('../index')(dbURI)
  , should   = require('chai').should()
  , async    = require('async')
  , mongoose = require('mongoose')
  , Dummy    = mongoose.model('Dummy', new mongoose.Schema({a:Number}))
;

describe("mongodb cleaner", function() {
  describe("inside mocha", function() {
    beforeEach(function(done) {
      if (mongoose.connection.db) return done();
      mongoose.connect(dbURI, function(err){
        if (err) return done(err);
        done();
      });
    });

    it("auto-registers itself as a beforeEach handler", function() {
    });

    it("allows normal db use", function(done) {
      new Dummy({a: 1}).save(function(err){
        if (err) return done(err);

        Dummy.find({}, function(err,docs){
          if (err) return done(err);

          docs.length.should.equal(1);
          done();
        });
      });
    });

    it("empties the db between specs", function(done) {
      Dummy.find({}, function(err, docs){
        if (err) return done(err);
        docs.length.should.equal(0);
        done();
      });
    });
  });

  describe("when called with a callback instead of a url", function() {
    it("throws an error", function(done) {
      var err;
      try {
        require('../index.js')(done)
      } catch(e) {
        err = e;
      } finally {
        should.exist(err);
        err.message.should.match(/being called to clean/);
        err.message.should.match(/with a mongodb url/);
        done();
      }
    });
  });

  describe(".clearCollections", function() {
    it("is available", function() {
      cleaner.clearCollections.should.be.a('function');
    });

    it("clears the database when called", function(done) {
      async.series([
        function(cb){
          new Dummy({a: 1}).save(cb);
        }
        ,function(cb){
          Dummy.find({}, function(err, docs){
            should.not.exist(err);
            docs.length.should.equal(1);
            cb();
          });
        }
        , cleaner.clearCollections
        , function(cb){
          Dummy.find({}, function(err, docs){
            should.not.exist(err);
            docs.length.should.equal(0);
            cb();
          });
        }
      ], done);
    });
  });
});

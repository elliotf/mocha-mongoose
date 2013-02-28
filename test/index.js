// make it extremely unlikely that this test unintentionally drops someone's DB
var uniqueId = 'c90b6960-0109-11e2-9595-00248c45df8a'
  , dbURI    = 'mongodb://localhost/mongodb-wiper-test-' + uniqueId
  , should   = require('chai').should()
  , async    = require('async')
  , mongoose = require('mongoose')
  , Dummy    = mongoose.model('Dummy', new mongoose.Schema({a:Number}))
;


describe("clearDB", function() {
  var clearDB, options;

  beforeEach(function(done) {
    options = {noClear: true};

    if (mongoose.connection.db) return done();
    mongoose.connect(dbURI, done);
  });

  describe(".clearDB", function() {
    beforeEach(function() {
      clearDB = require('../index')(dbURI, options);
    });

    it("is available", function() {
      clearDB.should.be.a('function');
    });

    it("clears the database when called", function(done) {
      async.series([
        function(cb){
          new Dummy({a: 1}).save(cb);
        }
        ,function(cb){
          Dummy.find({}, function(err, docs){
            should.not.exist(err);
            docs.length.should.be.above(0);
            cb();
          });
        }
        , clearDB
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

  describe("when called with a callback instead of a url", function() {
    it("throws an error", function(done) {
      var err;
      try {
        require('../index')(done, options);
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

  describe("inside mocha", function() {
    function itAllowsNormalUse() {
      it("allows normal db use", function(done) {
        new Dummy({a: 2}).save(function(err){
          if (err) return done(err);

          Dummy.find({}, function(err,docs){
            if (err) return done(err);

            docs.length.should.equal(1);
            done();
          });
        });
      });
    }

    describe("when required with the noClear option", function() {
      beforeEach(function() {
        clearDB = require('../index')(dbURI, options);
      });

      itAllowsNormalUse();

      it("does not clear out the DB automatically", function(done) {
        Dummy.find({}, function(err, docs){
          if (err) return done(err);
          docs.length.should.equal(1);

          clearDB(done);
        });
      });
    });

    describe("when required without the noClear option", function() {
      beforeEach(function() {
        clearDB = require('../index')(dbURI);
      });

      itAllowsNormalUse();

      it("automatically empties the db between specs", function(done) {
        Dummy.find({}, function(err, docs){
          if (err) return done(err);
          docs.length.should.equal(0);
          done();
        });
      });
    });
  });
});

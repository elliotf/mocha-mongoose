// make it extremely unlikely that this test unintentionally drops someone's DB
var uniqueId = 'c90b6960-0109-11e2-9595-00248c45df8a'
  , dbURI    = 'mongodb://localhost/mongodb-wiper-test-' + uniqueId
  , expect   = require('chai').expect
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
      expect(clearDB).to.be.a('function');
    });

    it("clears the database when called", function(done) {
      Dummy.create({a: 1}, function(err){
        if (err) return done(err);

        Dummy.find({}, function(err, docs){
          expect(err).to.not.exist;
          expect(docs).to.have.length.above(0);
          clearDB(function(err){
            Dummy.find({}, function(err, docs){
              expect(err).to.not.exist;
              expect(docs).to.have.length(0);
              done();
            });
          });
        });
      });
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
        expect(err).to.exist;
        expect(err.message).to.match(/being called to clean/);
        expect(err.message).to.match(/with a mongodb url/);
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

            expect(docs.length).to.equal(1);
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
          expect(docs.length).to.equal(1);

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
          expect(docs.length).to.equal(0);
          done();
        });
      });
    });
  });

  describe("system collections", function() {
    it("does not clear out system collections", function() {
      // well, this kind of sucks...  How do I test this?
    });
  });
});

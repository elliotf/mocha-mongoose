var dbURI    = 'mongodb://localhost/mongodb-wiper'
  , cleaner  = require('../index.js')
  , should   = require('should')
  , mongoose = require('mongoose')
  , Dummy    = mongoose.model('Dummy', new mongoose.Schema({a:Number}))
;

describe("mongodb cleaner", function() {
  describe("as a beforeEach handler", function() {
    beforeEach(function(done) {
      if (mongoose.connection.db) return done();
      mongoose.connect(dbURI, function(err){
        if (err) done(err);
        done();
      });
    });

    beforeEach(function(done) {
      cleaner(dbURI)(done);
    });

    it("allows normal db use", function(done) {
      new Dummy({a: 1}).save(function(err){
        if (err) return done(err);
        done();
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
        cleaner(done)
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
});

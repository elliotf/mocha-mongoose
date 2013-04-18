// manually clearing the DB
var dbURI    = 'mongodb://localhost/demo-app-clearing-db'
  , expect   = require('chai').expect
  , mongoose = require('mongoose')
  , Dummy    = mongoose.model('Dummy', new mongoose.Schema({a:Number}))

  , clearDB  = require('../index')(dbURI, {noClear: true})
// Normally, this is:
//, clearDB  = require('mocha-mongoose')(dbURI, {noClear: true})
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

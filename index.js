var url    = require('url')
  , client = require('mongodb').MongoClient
;

var beforeEachRegistered = false;

module.exports = function(uriString, options) {
  options = options || {};

  if (typeof uriString == 'function') {
    throw new Error("Module being called to clean the db.  Please call the module with a mongodb url.");
  }

  if (!uriString) {
    console.warn("!WARNING: no mongodb url provided.  Defaulting to mongo://localhost/test");
    uriString = 'mongo://localhost/test';
  }

  var db = null;

  if (!options.noClear && !beforeEachRegistered) {
    if ('function' == typeof beforeEach && beforeEach.length > 0) {
      // we're in a test suite that hopefully supports async operations
      beforeEach(clearDB);
      beforeEachRegistered = true;
    }
  }

  return function(done) {
    clearDB(done);
  };

  function clearDB(done) {
    if (db) return clearCollections(done);

    client.connect(uriString, function(err, newDb){
      if (err) return done(err);

      db = newDb;

      clearCollections(done);
    });
  }

  function clearCollections(done) {
    db.collections(function(err, collections){
      if (err) return done(err);

      var todo = collections.length;
      if (!todo) return done();

      collections.forEach(function(collection){
        if (collection.collectionName.match(/^system\./)) return --todo;

        collection.remove({},{safe: true}, function(){
          collection.dropAllIndexes(function() {
            if (--todo === 0) done();
          });
        });
      });
    });
  }
};

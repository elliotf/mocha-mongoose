var url    = require('url')
  , client = require('mongodb').MongoClient
;

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

  if (!options.noClear) {
    if ('function' == typeof beforeEach && beforeEach.length > 0) {
      // we're in a test suite that hopefully supports async operations
      beforeEach(clearDB);
    }
  }

  var skipCollections = {};
  (options.skipCollections || []).forEach(function(collectionName){
    skipCollections[collectionName] = true;
  });

  return function(done) {
    clearDB(done);
  };

  function clearDB(cb) {
    if (db) return clearCollections(cb);

    client.connect(uriString, function(err, newDb){
      if (err) return cb(err);

      db = newDb;

      clearCollections(cb);
    });
  }

  function clearCollections(cb) {
    db.collections(function(err, collections){
      if (err) return cb(err);

      var todo = collections.length;
      if (!todo) return cb();

      collections.forEach(function(collection){
        if (skipCollections[collection.collectionName]) return --todo;

        collection.remove({},{safe: true}, function(){
          if (--todo === 0) cb();
        });
      });
    });
  }
};

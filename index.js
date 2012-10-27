var url        = require('url')
  , mongodb    = require('mongodb')
  , Db         = mongodb.Db
  , Server     = mongodb.Server
  , Connection = mongodb.Connection
;

module.exports = function(uriString, options) {
  options = options || {};

  if ('function' == typeof uriString) {
    throw new Error("Module being called to clean the db. Call the module with a mongodb url to get a cleaner function");
  }

  if (!uriString) {
    console.warn("!WARNING: no mongodb url provided.  Defaulting to mongo://localhost/test");
    uriString = 'mongo://localhost/test';
  }

  var uri  = url.parse(uriString);
  var host = uri.hostname || 'localhost';
  var port = uri.port     || Connection.DEFAULT_PORT;
  var name = uri.path     || 'test';
  name = name.replace(/^[/]+/, '');

  var server   = new Server(host, port, {});
  var db       = new Db(name, server, { safe: true });
  var dbIsOpen = false;

  if (!options.noClear) {
    if ('function' == typeof beforeEach && beforeEach.length > 0) {
      // we're in a test suite that hopefully supports async operations
      beforeEach(clearDB);
    }
  }

  return function(done) {
    clearDB(done);
  }

  function clearDB(cb) {
    if (dbIsOpen) return clearCollections(cb);

    db.open(function(err, db) {
      if (err) return cb(err);

      dbIsOpen = true;
      clearCollections(cb);
    });
  }

  function clearCollections(cb) {
    db.collections(function(err, collections){
      if (err) return cb(err);

      var todo = collections.length;
      if (!todo) return cb();

      collections.forEach(function(collection){
        collection.remove({},{safe: true}, function(){
          if (--todo == 0) cb();
        });
      });
    });
  }
}

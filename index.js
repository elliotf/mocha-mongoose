var url        = require('url')
  , mongodb    = require('mongodb')
  , Db         = mongodb.Db
  , Server     = mongodb.Server
  , Connection = mongodb.Connection
;

module.exports = function(uriString) {
  if ('function' == typeof uriString) {
    throw new Error("Module being called to clean the db. Call the module with a mongodb url to get a cleaner function");
  }

  if (!uriString) {
    console.log("!WARNING: no mongodb url provided.  Defaulting to mongo://localhost/test");
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

  function beforeEachHandler(done) {
    if (dbIsOpen) return clearCollections(done);

    db.open(function(err, db) {
      if (err) return done(err);

      dbIsOpen = true;
      clearCollections(done);
    });
  }

  if ('function' == typeof beforeEach && beforeEach.length > 0) {
    // we're in a test suite that hopefully supports async operations
    beforeEach(beforeEachHandler);
  }

  beforeEachHandler.clearDB = function(done){
    clearCollections(done);
  }

  return beforeEachHandler;

  function clearCollections(done) {
    db.collections(function(err, collections){
      if (err) return done(err);

      var todo = collections.length;
      if (!todo) return done();

      collections.forEach(function(collection){
        collection.remove({},{safe: true}, function(){
          if (--todo == 0) done();
        });
      });
    });
  }
}

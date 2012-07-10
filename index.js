var mongoose = require('mongoose');

var i = 0;

beforeEach(function(done) {
  console.log("cleaning: ", i++);
  if (!mongoose.connection.db) {
    mongoose.connect('mongodb://localhost/test', function(err){
      if (err) throw err;
      clearDB();
    });
  } else {
    clearDB();
  }

  function clearDB() {
    var numToDo = 0;
    for (var kollection in mongoose.connection.collections) {
      ++numToDo;
      mongoose.connection.collections[kollection].remove(function(){
        if (--numToDo === 0) done();
      });
    }
  }
});

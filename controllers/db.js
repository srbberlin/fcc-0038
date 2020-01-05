const MongoClient = require('mongodb');
const ObjectId    = require('mongodb').ObjectID;
let   db;

const events      = require('events');
const event       = new events.EventEmitter();
let   retries     = 0;
const delay       = 300;

function connect () {
  MongoClient.connect(
    process.env.URL,
    { 
      useUnifiedTopology: true, 
      useNewUrlParser: true 
    },
    function (e, d) {
      if(!e){
        db = d.db(process.env.DB);
        console.log("Database connection established. ");
        event.emit('conn');
      } else {
        if(retries < 4){
          console.log('Retrying to connect db ', retries++, e);
          setTimeout(connect, delay);
        } else {
          console.log('Unable to connect db');
        }
      }
  });
}

connect();

function act (name, fn) { 
  if(db !== null) {
    //console.log('Database exists')
    fn(db.collection(name));
  } else {
    event.on('conn', function () {
      console.log('Database created')
      fn(db.collection(name));
    });
  }
};

exports.restart = function () {
  retries = 0;
  connect();
}

exports.getObjectID = function () { 
  const res = new ObjectId();
  return { hex: res.toHexString(), time: res.getTimestamp() };
}

exports.create = function (boardName, o, f) {
  act (boardName, function (collection) {
    collection.insertOne(o, function (err, res) {
      if (err) {
        f('no object created');
        throw err;
      }
      f(res.ops);
    });
  });
}

exports.updateOne = function (boardName, filter, o, f) {
  act (boardName, function (collection) {
    collection.updateOne(filter, o, function (err, res) {
      if (err) {
        f(res);
        throw err;
      }
      f(res);
    });
  })
}


exports.getOne = function (boardName, id, f) {
  act (boardName, function (collection) {
    collection.findOne({_id: id}, function (err, res) {
      if (err) {
        f('error getting object');
        throw err;
      }
      f(res)
    });
  })
}


exports.getMany = function (boardName, filter, f) {
  act (boardName, function (collection) {
    collection.find(filter).toArray(function (err, res) {
      if (err) {
        f('error getting objects');
        throw err;
      }
      f(res)
    });
  })
}

exports.del = function (boardName, filter, f) {
  act (boardName, function (collection) {
    collection.deleteOne(filter, function (err, res) {
      if (err) throw err;
      f(res);
    });
  })
}

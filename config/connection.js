const mongoClient = require("mongodb").MongoClient;

const state = {
  db: null,
};

module.exports.connect = (done) => {
  // const url = 'mongodb+srv://gurupriyan:ULupmsO4l1IYQZum@cluster0.vi3jx.mongodb.net/shopsy?retryWrites=true&w=majority';
  const url = process.env.DB_URL;
  const dbname = "shopsy";

  mongoClient.connect(url, (err, data) => {
    if (err) return done(err);
    state.db = data.db(dbname);
    done();
  });
};

module.exports.get = function () {
  return state.db;
};

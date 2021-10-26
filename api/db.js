require('dotenv').config();
const MongoClient = require('mongodb/lib/mongo_client');

const dbUrl = process.env.DB_URL || 'mongodb://localhost/issuetracker';
let db;

async function connectToDB() {
  const client = new MongoClient(dbUrl, { useNewUrlParser: true });
  await client.connect();
  console.log('Connected to MongoDB');
  db = client.db();
}

function getDb() {
  return db;
}

async function getNextSequence(name) {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}

module.exports = { connectToDB, getNextSequence, getDb };

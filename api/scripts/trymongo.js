const { MongoClient } = require('mongodb');

const dbUrl = process.env.DB_URL;
if (!dbUrl) {
  throw new Error('Env variable DB_URL is not provided');
}

function testWithCallbacks(errCallback) {
  const client = new MongoClient(dbUrl, { useNewUrlParser: true });
  client.connect((connErr) => {
    if (connErr) {
      errCallback(connErr);
      return;
    }
    console.log('Connected to MongoDB');

    const collection = client.db().collection('employees');

    const newEmployee = { id: 8, name: 'Callback', age: 15 };
    collection.insertOne(newEmployee, (insertErr, result) => {
      if (insertErr) {
        client.close();
        errCallback(insertErr);
        return;
      }

      console.log('Result of insert', result.insertedId);

      collection.find({ _id: result.insertedId }).toArray((findErr, documents) => {
        if (findErr) {
          client.close();
          errCallback(findErr);
          return;
        }

        console.log('Result of find is', documents);
        client.close();
      });
    });
  });
}

async function testWithAsync() {
  const client = new MongoClient(dbUrl, { useNewUrlParser: true });
  try {
    await client.connect();

    console.log('Connected to MongoDB');
    const collection = client.db().collection('employees');

    const newEmployee = { id: 9, name: 'Async', age: 15 };
    const result = await collection.insertOne(newEmployee);

    console.log('Result of insert', result.insertedId);

    const documents = await collection.find({ _id: result.insertedId }).toArray();
    console.log('Result of find is', documents);
  } catch (e) {
    console.error(e);
  } finally {
    if (client) {
      client.close();
    }
  }
}

testWithCallbacks((err) => {
  if (err) {
    console.error(err);
  }

  testWithAsync();
});

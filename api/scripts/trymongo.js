const { MongoClient } = require('mongodb');

const url = "mongodb+srv://dbUser:90yd51pl6n2XbqZX@cluster0.oetds.mongodb.net/issuetracker?retryWrites=true&w=majority"

function testWithCallbacks(errCallback) {
  const client = new MongoClient(url, { useNewUrlParser: true });
  client.connect((err, client) => {
    if (err) {
      errCallback(err);
      return;
    }
    console.log('Connected to MongoDB');

    const collection = client.db().collection('employees');

    const newEmployee = { id: 8, name: 'Callback', age: 15 };
    collection.insertOne(newEmployee, (err, result) => {
      if (err) {
        client.close();
        errCallback(err);
        return;
      }

      console.log('Result of insert', result.insertedId);

      collection.find({ _id: result.insertedId }).toArray((err, documents) => {
        if (err) {
          client.close();
          errCallback(err);
          return;
        }

        console.log('Result of find is', documents);
        client.close();
      })
    })
  });
};

async function testWithAsync() {
  const client = new MongoClient(url, { useNewUrlParser: true });
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
};

// testWithCallbacks((err) => {
//   if(err) {
//     console.error(err);
//   }
// });

testWithAsync();
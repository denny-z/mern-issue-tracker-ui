const express = require('express');

const app = express();
const filesMiddleware = express.static('public');
app.use('/', filesMiddleware);

app.listen(3000, function() {
  console.log('app started');
});

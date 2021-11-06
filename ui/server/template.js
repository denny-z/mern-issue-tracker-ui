function template(body) {
  return `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WELCOME</title>
  <link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css">
  <style>
    .panel-title a {
      width: 100%;
      display: block;
      cursor: pointer;
    }

    table.table-hover tr {
      cursor: pointer;
    }
  </style>
</head>

<body>
  <div id="content">${body}</div>
</body>

</html>
`;
}

module.exports = template;

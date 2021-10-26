let aboutMessage = 'Hello GraphQL world!';

function setMessage(_, { message }) {
  aboutMessage = message;
  return message;
}

function getMessage() {
  return aboutMessage;
}

module.exports = { setMessage, getMessage };

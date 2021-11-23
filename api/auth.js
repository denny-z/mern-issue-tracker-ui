const { AuthenticationError } = require('apollo-server-express');
const Router = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const cors = require('cors');

let { JWT_SECRET } = process.env;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV !== 'production') {
    JWT_SECRET = 'tempjwtsecret';
    console.log('Missing env var JWT_SECRET. Using unsafe dev token.');
  } else {
    console.log('Missing env var JWT_SECRET. Authentication disabled.');
  }
}

const routes = new Router();

const origin = process.env.UI_SERVER_ORIGIN || 'http://localhost:8000';
routes.use(cors({ origin, credentials: true }));

routes.use(Router.json());

function getUser(req) {
  const token = req.cookies.jwt;
  if (!token) return { signedIn: false };

  try {
    const credentials = jwt.verify(token, JWT_SECRET);
    return credentials;
  } catch (error) {
    return { signedIn: false };
  }
}

function resolveUser(_, args, { user }) {
  return user;
}

function mustBeSignedIn(resolver) {
  return (root, args, { user }) => {
    if (!user || !user.signedIn) {
      throw new AuthenticationError('You must be signed in');
    }

    return resolver(root, args, { user });
  };
}

routes.post('/signin', async (req, res) => {
  if (!JWT_SECRET) {
    res.status(500).send('Missing JWT_TOKEN. Refusing to authenticate');
  }

  const googleToken = req.body.google_token;
  if (!googleToken) {
    res.status(400).send({ code: 400, message: 'Missing token' });
    return;
  }

  const client = new OAuth2Client();
  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken: googleToken });
    payload = ticket.getPayload();
  } catch (error) {
    res.status(403).send('Invalid crendentials');
  }

  const { given_name: givenName, name, email } = payload;
  const credentials = {
    signedIn: true, givenName, name, email,
  };

  const token = jwt.sign(credentials, JWT_SECRET);
  res.cookie('jwt', token, { httpOnly: true, domain: process.env.COOKIE_DOMAIN });

  res.json(credentials);
});

routes.post('/user', (req, res) => {
  res.send(getUser(req));
});

routes.post('/signout', (req, res) => {
  res.clearCookie('jwt');
  res.json({ status: 'ok' });
});

module.exports = {
  routes, getUser, mustBeSignedIn, resolveUser,
};

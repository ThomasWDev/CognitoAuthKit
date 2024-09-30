const express = require('express');
const { CognitoRouter } = require('@thomas/cognito-node');
const app = express();

app.use(express.json());

const theRouter = new express.Router();

const PORT = process.env.PORT || 8081;

/**
 * Setup cognito plugin
 */
const cognitoRouter = new CognitoRouter({
  region: '', //region
  clientId: '', // cognito client id
  userPoolID: '', // cofnito user pool id
  mfaLabel: '', // MFA URL label
  mfaIssuer: '', // MFA issuer name
  router: theRouter, // express router
});

app.use('/api', cognitoRouter.router);

/**
 * Run the development server
 */
app.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});


# Cognito Node.js Package - `@thomaswoodfindev/cognitoauthkit`

A comprehensive Node.js package for managing AWS Cognito user authentication, sign-up, sign-in, MFA, password management, and more, built on AWS SDK v3 and Express.js.

## Features

- User Sign-Up & Sign-In
- Email OTP Verification
- Resend OTP
- Multi-Factor Authentication (MFA) with TOTP (Google Authenticator, Authy, etc.)
- Password Change & Reset
- Refresh Tokens
- MFA Enable & Disable
- Token-based Authentication (JWT)

## Installation

To get started with this package, first, install it via npm:

```bash
npm install @thomaswoodfindev/cognitoauthkit
```

Or using yarn:

```bash
yarn add @thomaswoodfindev/cognitoauthkit
```

## Prerequisites

Make sure you have an AWS Cognito User Pool and App Client set up. You will need:

1. **Region**: The AWS region where your Cognito User Pool is located.
2. **Client ID**: The Cognito App Client ID.
3. **User Pool ID**: The ID of your Cognito User Pool.
4. (Optional) **MFA Label** and **Issuer**: If you are using MFA, define a custom label and issuer for TOTP.

## Usage

### Step 1: Setup Express.js Application

Create an Express.js application and integrate the `CognitoRouter` from the package. Here's how:

```javascript
const express = require('express');
const { CognitoRouter } = require('@thomaswoodfindev/cognitoauthkit');
const app = express();

app.use(express.json());

const theRouter = new express.Router();

const PORT = process.env.PORT || 8081;

/**
 * Setup Cognito plugin
 */
const cognitoRouter = new CognitoRouter({
  region: '',           // AWS region
  clientId: '', // Cognito Client ID
  userPoolID: '', // Cognito User Pool ID
  mfaLabel: '',         // MFA label for TOTP
  mfaIssuer: '',       // MFA issuer name
  router: theRouter,             // Express Router instance
});

app.use('/api', cognitoRouter.router);

/**
 * Start the server
 */
app.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});
```

### Step 2: Define Environment Variables (Optional)

If you don't want to hardcode the AWS region, client ID, and user pool ID, you can use environment variables in a `.env` file:

```bash
AWS_REGION=us-east-2
COGNITO_CLIENT_ID=
COGNITO_USER_POOL_ID=
```

Use `dotenv` to load these variables:

```bash
npm install dotenv
```

Then, in your application:

```javascript
require('dotenv').config();

const cognitoRouter = new CognitoRouter({
  region: process.env.AWS_REGION,
  clientId: process.env.COGNITO_CLIENT_ID,
  userPoolID: process.env.COGNITO_USER_POOL_ID,
  mfaLabel: 'DevThomas',
  mfaIssuer: 'AWSCognito',
  router: theRouter,
});
```

### Step 3: Available API Routes

Once the `CognitoRouter` is set up, the following routes are available for managing authentication:

1. **Sign Up**  
   **POST** `/api/signup`  
   Request Body:
   ```json
   {
     "email": "user@example.com",
     "password": "Password123!"
   }
   ```

2. **Sign In**  
   **POST** `/api/signin`  
   Request Body:
   ```json
   {
     "email": "user@example.com",
     "password": "Password123!"
   }
   ```

3. **Confirm Sign-Up**  
   **POST** `/api/confirm-signup`  
   Request Body:
   ```json
   {
     "email": "user@example.com",
     "confirmationCode": "123456"
   }
   ```

4. **Resend Confirmation Code**  
   **POST** `/api/resend-otp`  
   Request Body:
   ```json
   {
     "email": "user@example.com"
   }
   ```

5. **Associate TOTP (MFA)**  
   **POST** `/api/associate-totp`  
   Request Body:
   ```json
   {
     "accessToken": "AccessTokenReceivedAfterSignIn"
   }
   ```

6. **Verify TOTP (MFA)**  
   **POST** `/api/verify-totp`  
   Request Body:
   ```json
   {
     "accessToken": "AccessTokenReceivedAfterSignIn",
     "otp": "123456"
   }
   ```

7. **Enable MFA**  
   **POST** `/api/enable-mfa`  
   Request Body:
   ```json
   {
     "accessToken": "AccessTokenReceivedAfterSignIn"
   }
   ```

8. **Disable MFA**  
   **POST** `/api/disable-mfa`  
   Request Body:
   ```json
   {
     "accessToken": "AccessTokenReceivedAfterSignIn"
   }
   ```

9. **Change Password**  
   **POST** `/api/change-password`  
   Request Body:
   ```json
   {
     "accessToken": "AccessTokenReceivedAfterSignIn",
     "oldPassword": "OldPassword123!",
     "newPassword": "NewPassword456!"
   }
   ```

10. **Forgot Password**  
    **POST** `/api/forgot-password`  
    Request Body:
    ```json
    {
      "email": "user@example.com"
    }
    ```

11. **Confirm Forgot Password (Reset Password)**  
    **POST** `/api/confirm-forgot-password`  
    Request Body:
    ```json
    {
      "email": "user@example.com",
      "confirmationCode": "123456",
      "newPassword": "NewPassword456!"
    }
    ```

12. **Refresh Token**  
    **POST** `/api/refresh-token`  
    Request Body:
    ```json
    {
      "refreshToken": "RefreshTokenReceivedAfterSignIn"
    }
    ```

### Step 4: Test the Application

You can use a tool like **Postman** or **curl** to test the routes.

#### Example: Testing Sign Up with Postman

- **Endpoint**: `/api/signup`
- **Method**: POST
- **Body** (JSON):
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```

If the request is successful, you should receive a response like:

```json
{
  "message": "User signed up successfully. Please check your email for the OTP.",
  "result": { ... }
}
```

### Step 5: Customization

You can customize the following parameters when setting up `CognitoRouter`:
- **Region**: The AWS region of your Cognito User Pool.
- **Client ID**: Your Cognito App Client ID.
- **User Pool ID**: The Cognito User Pool ID.
- **MFA Label & Issuer**: Customize the TOTP label and issuer that appear in the user's authenticator app.

If you want a custom setup to use this package with your own route, try following:
```javascript
const cognitoServiceInit = new CognitoService(
  '', //region
  '', // cognito client id
  '', // cofnito user pool id
  'NodeCognito', // MFA URL label
  'NodeCognito', // MFA issuer name
);

app.use('/users/login', async (req, res) => {
  const { email, password } = req.body;
  const cognitoResults = await cognitoServiceInit.signIn(email, password);

  console.log('cognitoResults:', cognitoResults);
  res.status(200).send({
    message: 'User login.',
    cognitoResults,
  });
});
```

You can disable specific routes by the following example:

1. Allow all routes: (by default)
```javascript
const cognitoRouter = new CognitoRouter({
  region: '', //region
  clientId: '', // cognito client id
  userPoolID: '', // cofnito user pool id
  router: theRouter, // Express Router instance
  disabledRoutes: {}, // No routes are disabled
});

app.use('/auth', cognitoRouter.router);
```
2. Disable specific routes
```javascript
const cognitoRouter = new CognitoRouter({
  region: '', //region
  clientId: '', // cognito client id
  userPoolID: '', // cofnito user pool id
  router: theRouter, // Express Router instance
  disabledRoutes: {
    signup: true, // Disable the signup route
    'enable-mfa': true, // Disable the enable-mfa route
  },
});

app.use('/auth', cognitoRouter.router);
```
Here are the default routes list:

1. /signup - Default sign up route
2. /signin - Default sign in route
3. /confirm-signup - Default confirm sign up route
4. /refresh-token - Default refresh token route
5. /resend-otp - Default resend email otp route
6. /associate-totp - Default associate auth app route
7. /verify-totp - Default 2fa(auth apps like Google authenticator, Microsoft authenticator, etc.) code verification route
8. /enable-mfa - Default route for enabling MFA for authenticated users
9. /disable-mfa - Default route for disabling MFA for authenticated users
10. /verify-mfa - Default route for verifying MFA for authenticated users
11. /change-password - Default change password route
12. /forgot-password - Default forgot password otp route
13. /confirm-forgot-password - Default forgot password route

### License

This project is licensed under the MIT License.


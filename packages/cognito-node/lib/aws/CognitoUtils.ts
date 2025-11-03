import * as crypto from 'crypto';

/**
 * Calculate the secret hash required for AWS Cognito API calls
 * when the app client has a client secret.
 * 
 * The secret hash is computed as: HMAC-SHA256(clientSecret, username + clientId)
 * 
 * @param username - The username (typically email) of the user
 * @param clientId - The Cognito App Client ID
 * @param clientSecret - The Cognito App Client Secret
 * @returns Base64 encoded secret hash
 */
export function calculateSecretHash(
  username: string,
  clientId: string,
  clientSecret: string,
): string {
  const message = username + clientId;
  const hmac = crypto.createHmac('sha256', clientSecret);
  hmac.update(message);
  return hmac.digest('base64');
}


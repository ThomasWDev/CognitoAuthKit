import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  AssociateSoftwareTokenCommand,
  VerifySoftwareTokenCommand,
  AdminSetUserMFAPreferenceCommand,
  ChangePasswordCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  SetUserMFAPreferenceCommand,
  RespondToAuthChallengeCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { calculateSecretHash } from './CognitoUtils';

export class CognitoService {
  private client: CognitoIdentityProviderClient;
  private clientId: string;
  private clientSecret: string;
  private cognitoUserPoolID: string;
  public cognitoMFALabel: string;
  public cognitoMFAIssuer: string;

  constructor(
    region: string,
    clientId: string,
    clientSecret: string,
    cognitoUserPoolID: string,
    cognitoMFALabel: string | 'NodeCognito',
    cognitoMFAIssuer: string | 'AWS',
  ) {
    this.client = new CognitoIdentityProviderClient({ region });
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.cognitoUserPoolID = cognitoUserPoolID;
    this.cognitoMFALabel = cognitoMFALabel;
    this.cognitoMFAIssuer = cognitoMFAIssuer;
  }

  /**
   * Calculate secret hash for a specific username
   * @param username - The username (email) to calculate secret hash for
   * @returns The secret hash or empty string if clientSecret is not set
   */
  private getSecretHash(username: string): string {
    if (!this.clientSecret) {
      return '';
    }
    return calculateSecretHash(username, this.clientId, this.clientSecret);
  }

  /**
   * Sign up user with email and password
   * @param email
   * @param password
   */
  async signUp(email: string, password: string) {
    const params: any = {
      ClientId: this.clientId,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
      ],
    };
    const secretHash = this.getSecretHash(email);
    if (secretHash) {
      params.SecretHash = secretHash;
    }

    const command = new SignUpCommand(params);

    try {
      const result = await this.client.send(command);
      return result;
    } catch (error) {
      throw new Error(`SignUp failed: ${error}`);
    }
  }

  /**
   * Sign in with email and password
   * @param email
   * @param password
   */
  async signIn(email: string, password: string) {
    const params: any = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: this.clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    }; 

    const secretHash = this.getSecretHash(email);
    if (secretHash) {
      params.AuthParameters.SECRET_HASH = secretHash;
    }

    const command = new InitiateAuthCommand(params);

    try {
      const result = await this.client.send(command);
      return result;
    } catch (error) {
      throw new Error(`SignIn failed: ${error}`);
    }
  }

  /**
   * Confirm the user's signup using the OTP (confirmation code)
   * @param email
   * @param confirmationCode
   */
  async confirmSignUp(email: string, confirmationCode: string) {
    const params: any = {
      ClientId: this.clientId,
      Username: email,
      ConfirmationCode: confirmationCode,
    };

    const secretHash = this.getSecretHash(email);
    if (secretHash) {
      params.SecretHash = secretHash;
    }

    const command = new ConfirmSignUpCommand(params);

    try {
      const result = await this.client.send(command);
      return result;
    } catch (error) {
      throw new Error(`ConfirmSignUp failed: ${error}`);
    }
  }

  /**
   * Resend the confirmation code (OTP) to the user's email
   * @param email
   */
  async resendConfirmationCode(email: string) {
    const params: any = {
      ClientId: this.clientId,
      Username: email,
    };

    const secretHash = this.getSecretHash(email);
    if (secretHash) {
      params.SecretHash = secretHash;
    }

    const command = new ResendConfirmationCodeCommand(params);

    try {
      const result = await this.client.send(command);
      return result;
    } catch (error) {
      throw new Error(`ResendConfirmationCode failed: ${error}`);
    }
  }

  /**
   * Associate TOTP device (Authenticator app)
   * @param accessToken
   */
  async associateSoftwareToken(accessToken: string) {
    const params = {
      AccessToken: accessToken,
    };

    const command = new AssociateSoftwareTokenCommand(params);

    try {
      const result = await this.client.send(command);
      return result; // This will return the secret key to show in the authenticator app
    } catch (error) {
      throw new Error(`AssociateSoftwareToken failed: ${error}`);
    }
  }

  /**
   * Verify the TOTP code from the Authenticator app
   * @param accessToken
   * @param otp
   */
  async verifySoftwareToken(accessToken: string, otp: string) {
    const params = {
      AccessToken: accessToken,
      UserCode: otp,
    };

    const command = new VerifySoftwareTokenCommand(params);

    try {
      const result = await this.client.send(command);
      return result;
    } catch (error) {
      throw new Error(`VerifySoftwareToken failed: ${error}`);
    }
  }

  /**
   * Enable 2FA after TOTP has been verified
   * @param accessToken
   */
  async enableMFA(accessToken: string) {
    const command = new SetUserMFAPreferenceCommand({
      AccessToken: accessToken,
      SoftwareTokenMfaSettings: {
        Enabled: true,
        PreferredMfa: true,
      },
    });

    try {
      const result = await this.client.send(command);
      return result;
    } catch (error) {
      throw new Error(`EnableMFA failed: ${error}`);
    }
  }

  /**
   * Enable 2FA after TOTP has been verified
   * @param accessToken
   */
  async disableMFA(accessToken: string) {
    const command = new SetUserMFAPreferenceCommand({
      AccessToken: accessToken,
      SoftwareTokenMfaSettings: {
        Enabled: false,
        PreferredMfa: false,
      },
    });

    try {
      const result = await this.client.send(command);
      return result;
    } catch (error) {
      throw new Error(`EnableMFA failed: ${error}`);
    }
  }

  /**
   * Respond to MFA challenge
   * @param mfaCode
   * @param session
   * @param email
   */
  async respondToMfaChallenge(mfaCode: string, session: string, email: string) {
    const params: any = {
      ChallengeName: 'SOFTWARE_TOKEN_MFA', // Indicates MFA challenge
      ClientId: this.clientId,
      Session: session, // Session token from the initial login attempt
      ChallengeResponses: {
        USERNAME: email, // Username or email of the user
        SOFTWARE_TOKEN_MFA_CODE: mfaCode, // MFA code from the authenticator app
      },
    };

    const secretHash = this.getSecretHash(email);
    if (secretHash) {
      params.ChallengeResponses.SECRET_HASH = secretHash;
    }

    const command = new RespondToAuthChallengeCommand(params);

    try {
      const result = await this.client.send(command);

      // This should now contain accessToken, idToken, refreshToken
      return result.AuthenticationResult;
    } catch (error) {
      throw new Error(`MFA validation failed: ${error}`);
    }
  }

  /**
   * Change password for authenticated users
   * @param accessToken
   * @param oldPassword
   * @param newPassword
   */
  async changePassword(
    accessToken: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const params = {
      AccessToken: accessToken,
      PreviousPassword: oldPassword,
      ProposedPassword: newPassword,
    };

    const command = new ChangePasswordCommand(params);

    try {
      const result = await this.client.send(command);
      return result;
    } catch (error) {
      throw new Error(`ChangePassword failed: ${error}`);
    }
  }

  /**
   * Start the reset password process (Forgot Password)
   * @param email
   */
  async forgotPassword(email: string) {
    const params: any = {
      ClientId: this.clientId,
      Username: email,
    };

    const secretHash = this.getSecretHash(email);
    if (secretHash) {
      params.SecretHash = secretHash;
    }

    const command = new ForgotPasswordCommand(params);

    try {
      const result = await this.client.send(command);
      return result;
    } catch (error) {
      throw new Error(`ForgotPassword failed: ${error}`);
    }
  }

  /**
   * Confirm the new password using the confirmation code (OTP)
   * @param email
   * @param confirmationCode
   * @param newPassword
   */
  async confirmForgotPassword(
    email: string,
    confirmationCode: string,
    newPassword: string,
  ) {
    const params: any = {
      ClientId: this.clientId,
      Username: email,
      ConfirmationCode: confirmationCode,
      Password: newPassword,
    };

    const secretHash = this.getSecretHash(email);
    if (secretHash) {
      params.SecretHash = secretHash;
    }

    const command = new ConfirmForgotPasswordCommand(params);

    try {
      const result = await this.client.send(command);
      return result;
    } catch (error) {
      throw new Error(`ConfirmForgotPassword failed: ${error}`);
    }
  }

  /**
   * Use refresh token to get a new access token
   * @param refreshToken
   * @param username - Optional username/email for secret hash calculation
   */
  async refreshToken(refreshToken: string, username?: string) {
    const params: any = {
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: this.clientId,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    };

    if (username) {
      const secretHash = this.getSecretHash(username);
      if (secretHash) {
        params.AuthParameters.SECRET_HASH = secretHash;
      }
    }

    const command = new InitiateAuthCommand(params);

    try {
      const result = await this.client.send(command);
      return result.AuthenticationResult; // Contains new accessToken and idToken
    } catch (error) {
      throw new Error(`RefreshToken failed: ${error}`);
    }
  }
}

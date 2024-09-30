import { CognitoService } from './CognitoService';
import { Request, Response } from 'express';
import QRCode from 'qrcode';

export class CognitoController {
  private cognitoService: CognitoService;

  constructor(cognitoService: CognitoService) {
    this.cognitoService = cognitoService;
  }

  /**
   * Sign up controller for handling users
   * @param req
   * @param res
   */
  async signUp(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    try {
      const result = await this.cognitoService.signUp(email, password);
      res.status(200).send({
        message:
          'User signed up successfully. Please check your email for the OTP.',
        result,
      });
    } catch (error) {
      res.status(500).send({
        message: 'Signup failed',
        // @ts-ignore
        error: error.message,
      });
    }
  }

  /**
   * Sign in controller
   * @param req
   * @param res
   */
  async signIn(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    try {
      const result = await this.cognitoService.signIn(email, password);
      res.status(200).send({
        message: 'User signed in successfully',
        result,
      });
    } catch (error) {
      res.status(500).send({
        message: 'Signin failed',
        // @ts-ignore
        error: error.message,
      });
    }
  }

  /**
   * Confirm the OTP received via email
   * @param req
   * @param res
   */
  async confirmSignUp(req: Request, res: Response): Promise<void> {
    const { email, confirmationCode } = req.body;

    try {
      const result = await this.cognitoService.confirmSignUp(
        email,
        confirmationCode,
      );
      res.status(200).send({
        message: 'Email confirmed successfully',
        result,
      });
    } catch (error) {
      res.status(500).send({
        message: 'Email confirmation failed',
        // @ts-ignore
        error: error.message,
      });
    }
  }

  /**
   * Resend OTP to user's email
   * @param req
   * @param res
   */
  async resendConfirmationCode(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    try {
      const result = await this.cognitoService.resendConfirmationCode(email);
      res.status(200).send({
        message: 'OTP resent successfully',
        result,
      });
    } catch (error) {
      res.status(500).send({
        message: 'Failed to resend OTP',
        // @ts-ignore
        error: error.message,
      });
    }
  }

  /**
   * Endpoint to associate a TOTP device
   * @param req
   * @param res
   */
  async associateSoftwareToken(req: Request, res: Response): Promise<void> {
    const { accessToken } = req.body;

    try {
      const result =
        await this.cognitoService.associateSoftwareToken(accessToken);

      // otpauth://totp/NodeCognito?secret=PG4HYAHRHPXCNKPESP2IPXKSJPZD2HVESJF4SSFIW7FRRDJXBSCQ&issuer=AWS

      // Secret returned from AWS Cognito for TOTP
      const secretCode = result.SecretCode;

      // Generate the URI required for TOTP
      const otpAuthUrl = `otpauth://totp/${this.cognitoService.cognitoMFALabel}?secret=${secretCode}&issuer=${this.cognitoService.cognitoMFAIssuer}`;

      // Generate QR code from the URI
      const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

      res.status(200).send({
        message:
          'TOTP associated successfully. Use this secret in your Authenticator app.',
        result: {
          SecretCode: result?.SecretCode,
          qrcode: qrCodeDataUrl,
        },
      });
    } catch (error) {
      res.status(500).send({
        message: 'Failed to associate TOTP',
        // @ts-ignore
        error: error.message,
      });
    }
  }

  /**
   * Endpoint to verify the TOTP code
   * @param req
   * @param res
   */
  async verifySoftwareToken(req: Request, res: Response): Promise<void> {
    const { accessToken, otp } = req.body;

    try {
      const result = await this.cognitoService.verifySoftwareToken(
        accessToken,
        otp,
      );
      res.status(200).send({
        message: 'TOTP verified successfully.',
        result,
      });
    } catch (error) {
      res.status(500).send({
        message: 'Failed to verify TOTP',
        // @ts-ignore
        error: error.message,
      });
    }
  }

  /**
   * Endpoint to enable MFA for the user after successful TOTP verification
   * @param req
   * @param res
   */
  async enableMFA(req: Request, res: Response): Promise<void> {
    const { accessToken } = req.body;

    try {
      const result = await this.cognitoService.enableMFA(accessToken);
      res.status(200).send({
        message: 'MFA enabled successfully.',
        result,
      });
    } catch (error) {
      res.status(500).send({
        message: 'Failed to enable MFA',
        // @ts-ignore
        error: error.message,
      });
    }
  }

  /**
   * Endpoint to enable MFA for the user after successful TOTP verification
   * @param req
   * @param res
   */
  async disableMFA(req: Request, res: Response): Promise<void> {
    const { accessToken } = req.body;

    try {
      const result = await this.cognitoService.disableMFA(accessToken);
      res.status(200).send({
        message: 'MFA disabled successfully.',
        result,
      });
    } catch (error) {
      res.status(500).send({
        message: 'Failed to disable MFA',
        // @ts-ignore
        error: error.message,
      });
    }
  }

  /**
   * User submits MFA code to verify
   * @param req
   * @param res
   */
  async verifyMfa(req: Request, res: Response): Promise<void> {
    const { mfaCode, session, email } = req.body;

    try {
      const result = await this.cognitoService.respondToMfaChallenge(
        mfaCode,
        session,
        email,
      );

      // Return tokens after successful MFA validation
      res.status(200).send({
        message: 'MFA verification successful',
        accessToken: result?.AccessToken,
        idToken: result?.IdToken,
        refreshToken: result?.RefreshToken,
      });
    } catch (error) {
      res.status(500).send({
        message: 'MFA verification failed',
        // @ts-ignore
        error: error.message,
      });
    }
  }

  /**
   * Change password for authenticated users
   * @param req
   * @param res
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    const { accessToken, oldPassword, newPassword } = req.body; // Get the accessToken, old password, and new password

    try {
      const result = await this.cognitoService.changePassword(
        accessToken,
        oldPassword,
        newPassword,
      );
      res.status(200).send({
        message: 'Password changed successfully.',
        result,
      });
    } catch (error) {
      res.status(500).send({
        message: 'Failed to change password',
        // @ts-ignore
        error: error.message,
      });
    }
  }

  /**
   * Start the reset password process (Forgot Password)
   * @param req
   * @param res
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body; // Get the user's email

    try {
      const result = await this.cognitoService.forgotPassword(email);
      res.status(200).send({
        message:
          'Password reset initiated. Please check your email for the OTP.',
        result,
      });
    } catch (error) {
      res.status(500).send({
        message: 'Failed to initiate password reset',
        // @ts-ignore
        error: error.message,
      });
    }
  }

  /**
   * Confirm the new password using the OTP
   * @param req
   * @param res
   */
  async confirmForgotPassword(req: Request, res: Response): Promise<void> {
    const { email, confirmationCode, newPassword } = req.body; // Get email, OTP, and new password

    try {
      const result = await this.cognitoService.confirmForgotPassword(
        email,
        confirmationCode,
        newPassword,
      );
      res.status(200).send({
        message: 'Password reset successfully.',
        result,
      });
    } catch (error) {
      res.status(500).send({
        message: 'Failed to reset password',
        // @ts-ignore
        error: error.message,
      });
    }
  }

  /**
   * Refresh the access token using the refresh token
   * @param req
   * @param res
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;

    try {
      const result = await this.cognitoService.refreshToken(refreshToken);
      res.status(200).send({
        message: 'Token refreshed successfully',
        accessToken: result?.AccessToken,
        idToken: result?.IdToken, // Optionally, a new IdToken is returned
      });
    } catch (error) {
      res.status(500).send({
        message: 'Failed to refresh token',
        // @ts-ignore
        error: error.message,
      });
    }
  }
}

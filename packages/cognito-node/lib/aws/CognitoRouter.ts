import { Router } from 'express';
import { CognitoController } from './CognitoController';
import { CognitoService } from './CognitoService';

export interface CognitoParams {
  region: string;
  clientId: string;
  userPoolID: string;
  clientSecret?: string;
  mfaLabel?: string;
  mfaIssuer?: string;
  router?: Router; // Optional router parameter
  disabledRoutes?: { [key: string]: boolean }; // Optional disabledRoutes parameter
}

export class CognitoRouter {
  public router: Router;
  private cognitoService: CognitoService;
  private cognitoController: CognitoController;
  private cognitoUserPoolID: string;
  private disabledRoutes: { [key: string]: boolean };

  constructor({
    region,
    clientId,
    userPoolID,
    clientSecret,
    mfaLabel,
    mfaIssuer,
    router,
    disabledRoutes = {},
  }: CognitoParams) {
    this.cognitoService = new CognitoService(
      region,
      clientId,
      clientSecret || '',
      userPoolID,
      mfaLabel || 'NodeCognito',
      mfaIssuer || 'AWS',
    );
    this.cognitoController = new CognitoController(this.cognitoService);
    this.cognitoUserPoolID = userPoolID;

    // Initialize router if not provided
    this.router = router || Router(); // Default to a new Router instance if not provided
    this.disabledRoutes = disabledRoutes;

    this.initializeRoutes();
  }

  /**
   * Initialize the routes
   * @private
   */
  private initializeRoutes(): void {
    /**
     * Sign Up router
     */
    if (!this.disabledRoutes['signup']) {
      this.router.post('/signup', (req, res) =>
        this.cognitoController.signUp(req, res),
      );
    }

    /**
     * Sign In router
     */
    if (!this.disabledRoutes['signin']) {
      this.router.post('/signin', (req, res) =>
        this.cognitoController.signIn(req, res),
      );
    }

    /**
     * Confirm email OTP
     */
    if (!this.disabledRoutes['confirm-signup']) {
      this.router.post('/confirm-signup', (req, res) =>
        this.cognitoController.confirmSignUp(req, res),
      );
    }

    /**
     * Token refresh route
     */
    if (!this.disabledRoutes['refresh-token']) {
      this.router.post('/refresh-token', (req, res) =>
        this.cognitoController.refreshToken(req, res),
      );
    }

    /**
     * Resend OTP
     */
    if (!this.disabledRoutes['resend-otp']) {
      this.router.post('/resend-otp', (req, res) =>
        this.cognitoController.resendConfirmationCode(req, res),
      );
    }

    /**
     * Associate TOTP
     */
    if (!this.disabledRoutes['associate-totp']) {
      this.router.post('/associate-totp', (req, res) =>
        this.cognitoController.associateSoftwareToken(req, res),
      );
    }

    /**
     * Verify TOTP
     */
    if (!this.disabledRoutes['verify-totp']) {
      this.router.post('/verify-totp', (req, res) =>
        this.cognitoController.verifySoftwareToken(req, res),
      );
    }

    /**
     * Enable MFA
     */
    if (!this.disabledRoutes['enable-mfa']) {
      this.router.post('/enable-mfa', (req, res) =>
        this.cognitoController.enableMFA(req, res),
      );
    }

    /**
     * Disable MFA
     */
    if (!this.disabledRoutes['disable-mfa']) {
      this.router.post('/disable-mfa', (req, res) =>
        this.cognitoController.disableMFA(req, res),
      );
    }

    /**
     * Verify MFA
     */
    if (!this.disabledRoutes['verify-mfa']) {
      this.router.post('/verify-mfa', (req, res) =>
        this.cognitoController.verifyMfa(req, res),
      );
    }

    /**
     * Change password
     */
    if (!this.disabledRoutes['change-password']) {
      this.router.post('/change-password', (req, res) =>
        this.cognitoController.changePassword(req, res),
      );
    }

    /**
     * Forgot password
     */
    if (!this.disabledRoutes['forgot-password']) {
      this.router.post('/forgot-password', (req, res) =>
        this.cognitoController.forgotPassword(req, res),
      );
    }

    /**
     * Confirm forgot password (Reset password)
     */
    if (!this.disabledRoutes['confirm-forgot-password']) {
      this.router.post('/confirm-forgot-password', (req, res) =>
        this.cognitoController.confirmForgotPassword(req, res),
      );
    }
  }
}

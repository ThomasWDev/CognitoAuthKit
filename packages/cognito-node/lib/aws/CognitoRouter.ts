import { Router } from 'express';
import { CognitoController } from './CognitoController';
import { CognitoService } from './CognitoService';

export interface CognitoParams {
  region: string;
  clientId: string;
  userPoolID: string;
  mfaLabel?: string;
  mfaIssuer?: string;
  router: Router;
}

export class CognitoRouter {
  public router: Router;
  private cognitoService: CognitoService;
  private cognitoController: CognitoController;
  private cognitoUserPoolID: string;

  constructor({
    region,
    clientId,
    userPoolID,
    mfaLabel,
    mfaIssuer,
    router,
  }: CognitoParams) {
    this.router = Router();
    this.cognitoService = new CognitoService(
      region,
      clientId,
      userPoolID,
      mfaLabel || 'NodeCognito',
      mfaIssuer || 'AWS',
    );
    this.cognitoController = new CognitoController(this.cognitoService);
    this.cognitoUserPoolID = userPoolID;
    this.router = router;

    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    /**
     * Sign Up router
     */
    this.router.post('/signup', (req, res) =>
      this.cognitoController.signUp(req, res),
    );

    /**
     * Sign In router
     */
    this.router.post('/signin', (req, res) =>
      this.cognitoController.signIn(req, res),
    );

    /**
     * Confirm email OTP
     */
    this.router.post('/confirm-signup', (req, res) =>
      this.cognitoController.confirmSignUp(req, res),
    );

    /**
     * Token refresh route
     */
    this.router.post('/refresh-token', (req, res) =>
      this.cognitoController.refreshToken(req, res),
    );

    /**
     * Resend OTP
     */
    this.router.post('/resend-otp', (req, res) =>
      this.cognitoController.resendConfirmationCode(req, res),
    );

    /**
     * Associate TOTP
     */
    this.router.post('/associate-totp', (req, res) =>
      this.cognitoController.associateSoftwareToken(req, res),
    );

    /**
     * Verify TOTP
     */
    this.router.post('/verify-totp', (req, res) =>
      this.cognitoController.verifySoftwareToken(req, res),
    );

    /**
     * Enable MFA
     */
    this.router.post('/enable-mfa', (req, res) =>
      this.cognitoController.enableMFA(req, res),
    );

    /**
     * Disable MFA
     */
    this.router.post('/disable-mfa', (req, res) =>
      this.cognitoController.disableMFA(req, res),
    );

    /**
     * Verify MFA
     */
    this.router.post('/verify-mfa', (req, res) =>
      this.cognitoController.verifyMfa(req, res),
    );

    /**
     * Change password
     */
    this.router.post('/change-password', (req, res) =>
      this.cognitoController.changePassword(req, res),
    );

    /**
     * Forgot password
     */
    this.router.post('/forgot-password', (req, res) =>
      this.cognitoController.forgotPassword(req, res),
    );

    /**
     * Confirm forgot password (Reset password)
     */
    this.router.post('/confirm-forgot-password', (req, res) =>
      this.cognitoController.confirmForgotPassword(req, res),
    );
  }
}

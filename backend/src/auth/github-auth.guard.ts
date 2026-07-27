import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * passport-github2 calls req.login() after a successful OAuth exchange
 * unless session support is explicitly disabled. This app has no
 * express-session middleware, so without { session: false } that call
 * fails silently and Passport ends up bouncing the request back through
 * the OAuth flow - the "reload and reload" loop.
 */
@Injectable()
export class GithubAuthGuard extends AuthGuard('github') {
  constructor() {
    super({ session: false });
  }
}

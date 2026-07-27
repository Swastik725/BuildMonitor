import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Same fix as GithubAuthGuard: no session middleware in this app, so
 * Passport must be told not to rely on req.login()/sessions. */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor() {
    super({ session: false });
  }
}

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, StrategyOptions } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { getFrontendUrl } from '../config/runtime';
dotenv.config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    const options: StrategyOptions = {
      clientID: process.env.GOOGLE_CLIENT_ID || 'local-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'local-google-client-secret',
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        `${getFrontendUrl().replace(/:\d+$/, ':3001')}/auth/google/callback`,
      scope: ['email', 'profile'],
    };

    super(options);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const { id, name, emails, photos } = profile;
    const user = {
      providerId: id,
      email: emails?.[0]?.value || `${id}@users.noreply.google.com`,
      fullName: `${name.givenName} ${name.familyName}`,
      avatarUrl: photos?.[0]?.value,
    };
    done(null, user);
  }
}

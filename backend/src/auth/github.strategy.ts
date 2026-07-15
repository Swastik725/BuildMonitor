import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    // GitHub's profile.emails can be empty if the user hides their email —
    // fall back to a placeholder if needed
    const email = profile.emails?.[0]?.value ?? `${profile.username}@users.noreply.github.com`;

    const user = {
      providerId: profile.id.toString(),
      email,
      fullName: profile.displayName || profile.username,
      avatarUrl: profile.photos?.[0]?.value,
    };
    done(null, user);
  }
}
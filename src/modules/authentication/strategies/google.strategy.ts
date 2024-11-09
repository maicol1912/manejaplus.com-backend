import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: '300853876868-psu7phc1q53p5b92l7tko7dotett30jn.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'https://localhost:3001/manejaplusback/auth/google-callback',
      scope: ['email', 'profile']
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback
  ): Promise<any> {
    const { name, emails, photos, provider, id } = profile;
    const user = {
      email: emails[0].value,
      name: `${name.givenName} ${name.familyName}`,
      picture: photos[0].value,
      provider,
      id,
      accessToken
    };

    done(null, user);
  }
}

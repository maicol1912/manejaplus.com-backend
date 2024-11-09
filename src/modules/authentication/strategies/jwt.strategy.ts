import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EXTRACTOR_JWT } from './extractor/jwt-encrypted.extractor';
import { Envconfig } from 'src/tools/env.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: EXTRACTOR_JWT.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: Envconfig.AUTH_SECRET_KEY
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub };
  }
}

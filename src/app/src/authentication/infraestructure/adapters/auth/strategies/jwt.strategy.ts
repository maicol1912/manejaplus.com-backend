import config from 'config';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EXTRACTOR_JWT } from './extractor/jwt-encrypted.extractor';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: EXTRACTOR_JWT.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('AUTH.SECRET_KEY')
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub };
  }
}

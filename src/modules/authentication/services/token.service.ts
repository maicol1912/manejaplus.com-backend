import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AtLeastOneProperty } from "src/core/types/least-one-propertie";
import { Envconfig } from "src/tools/env.config";
import { AuthTokens } from "./auth.service";
import { UserModel } from "src/modules/users/models/user.model";

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  public async generateAccessToken(payload: Record<string, any>): Promise<string> {
    return this.jwtService.signAsync(
      { sub: payload },
      { expiresIn: Envconfig.AUTH_TIME_ACCESS_TOKEN }
    );
  }

  public async generateVerificationToken(payload: Record<string, any>): Promise<string> {
    return this.jwtService.signAsync(
      { sub: payload },
      { expiresIn: Envconfig.AUTH_TIME_VERIFY_ACCOUNT }
    );
  }

  public async generateTokenPair(payload: AtLeastOneProperty<UserModel>): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: payload },
        { expiresIn: Envconfig.AUTH_TIME_ACCESS_TOKEN }
      ),
      this.jwtService.signAsync(
        { sub: payload },
        { expiresIn: Envconfig.AUTH_TIME_REFRESH_TOKEN }
      )
    ]);

    return {
      accessToken,
      refreshToken
    };
  }

  public decodeToken(token: string): any {
    return this.jwtService.decode(token);
  }
}
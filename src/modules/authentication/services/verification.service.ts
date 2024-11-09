import { Injectable } from "@nestjs/common";
import { VerifingAccountException } from "../exceptions/verifing-account.exception";
import { TokenService } from "./token.service";
import { UserRepository } from "@persistence/repositories/user.repository";

export interface UserVerificationResponse {
    email: string;
    name: string;
  }

  
@Injectable()
export class UserVerificationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService
  ) {}

  public async verifyAccount(token: string): Promise<UserVerificationResponse> {
    try {
      const decodedToken = this.tokenService.decodeToken(token);
      const { email, id } = decodedToken.sub;
      const user = await this.userRepository.findByField({ email, id });

      if (!user) {
        throw new VerifingAccountException();
      }

      user.isVerified = true;
      const updatedUser = await this.userRepository.save(user);

      return {
        email: updatedUser.email,
        name: updatedUser.name,
      };
    } catch (error) {
      throw new VerifingAccountException();
    }
  }

  public async unlockAccount(token: string): Promise<UserVerificationResponse> {
    try {
      const decodedToken = this.tokenService.decodeToken(token);
      const { email, id } = decodedToken.sub;
      const user = await this.userRepository.findByField({ email, id });

      if (!user) {
        throw new VerifingAccountException();
      }

      user.isBlocked = false;
      const updatedUser = await this.userRepository.save(user);

      return {
        email: updatedUser.email,
        name: updatedUser.name,
      };
    } catch (error) {
      throw new VerifingAccountException();
    }
  }
}
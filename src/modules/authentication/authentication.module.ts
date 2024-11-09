import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TwilioModule } from 'nestjs-twilio';
import { Envconfig } from 'src/tools/env.config';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { MessagingService } from './services/messaging.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { OtpService } from './services/otp.service';
import { PermissionService } from './services/permission.service';
import { RoleService } from './services/role.service';
import { TokenService } from './services/token.service';
import { UserVerificationService } from './services/verification.service';
import { PersistenceModule } from '@persistence/persistence.module';
import { UsersModule } from '../users/users.module';



@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => UsersModule),
    PassportModule,
    JwtModule.register({
      secret: Envconfig.AUTH_SECRET_KEY,
      signOptions: { expiresIn: Envconfig.AUTH_TIME_REFRESH_TOKEN},
    }),
    TwilioModule.forRoot({
      accountSid: Envconfig.AUTH_TWILIO_ACCOUNT_SID,
      authToken: Envconfig.AUTH_TWILIO_AUTH_TOKEN,
    }),
  ],
  controllers: [AuthController],
  providers: [
    OtpService,
    PermissionService,
    RoleService,
    AuthService,
    TokenService,
    UserVerificationService,
    JwtStrategy,
    MessagingService,
    GoogleStrategy,
  ],
  exports: [AuthService,MessagingService,PermissionService,RoleService,TokenService,UserVerificationService],
})
export class AuthenticationModule {}

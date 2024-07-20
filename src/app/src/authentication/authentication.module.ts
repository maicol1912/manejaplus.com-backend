import config from 'config';
import { Module } from '@nestjs/common';
import { AuthService } from './application/services/auth.service';
import { AuthRepositoryImpl } from './domain/repositories/auth.repository';
import { AuthController } from './infraestructure/web/controllers/auth.controller';
import { UsersModule } from '@app/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './infraestructure/adapters/auth/strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: config.get<string>('AUTH.SECRET_KEY'),
      signOptions: { expiresIn: config.get<string>('AUTH.TIME_REFRESH_TOKEN') }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepositoryImpl, JwtStrategy]
})
export class AuthenticationModule {}

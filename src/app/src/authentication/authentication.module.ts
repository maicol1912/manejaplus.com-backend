import { Module } from '@nestjs/common';
import { AuthService } from './application/services/auth.service';
import { AuthRepositoryImpl } from './domain/repositories/auth.repository';
import { AuthController } from './infraestructure/web/controllers/auth.controller';
import { UsersModule } from '@app/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, AuthRepositoryImpl]
})
export class AuthenticationModule {}

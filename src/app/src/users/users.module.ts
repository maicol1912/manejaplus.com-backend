import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './infraestructure/web/controllers/user.controller';
import { UserRepositoryImpl } from './infraestructure/adapters/persistence/repository/user-impl.repository';
import { UserService } from './application/services/user.service';
import { UserEntity } from './infraestructure/adapters/persistence/entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersistenceModule } from '@app/persistence/persistence.module';
import { MailerService } from '@libs/mailer/mailer.service';
import { AuthService } from '@app/authentication/application/services/auth.service';
import { AuthRepositoryImpl } from '@app/authentication/domain/repositories/auth.repository';
import { JwtService } from '@nestjs/jwt';
import { AuthenticationModule } from '@app/authentication/authentication.module';

@Module({
  imports: [forwardRef(() => AuthenticationModule)],
  controllers: [UserController],
  providers: [UserRepositoryImpl, UserService, MailerService],
  exports: [UserRepositoryImpl]
})
export class UsersModule {}

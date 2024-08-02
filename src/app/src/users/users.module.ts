import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './infraestructure/web/controllers/user.controller';
import { UserRepositoryImpl } from './infraestructure/adapters/persistence/repository/user-impl.repository';
import { UserService } from './application/services/user.service';
import { MailerService } from '@libs/mailer/mailer.service';
import { AuthenticationModule } from '@app/authentication/authentication.module';

@Module({
  imports: [forwardRef(() => AuthenticationModule)],
  controllers: [UserController],
  providers: [UserRepositoryImpl, UserService, MailerService],
  exports: [UserRepositoryImpl]
})
export class UsersModule {}

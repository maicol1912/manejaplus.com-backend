import { forwardRef, Module } from "@nestjs/common";
import { UserController } from "./controllers/user.controller";
import { OtpService } from "./services/otp.service";
import { UserService } from "./services/user.service";
import { MailerService } from "src/libs/mailer/mailer.service";
import { AuthenticationModule } from "@authentication/authentication.module";
import { PersistenceModule } from "@persistence/persistence.module";


@Module({
  imports: [
    forwardRef(() => AuthenticationModule),
    PersistenceModule
  ],
  controllers: [UserController],
  providers: [OtpService,UserService,MailerService],
  exports: [OtpService,MailerService],
})
export class UsersModule {}

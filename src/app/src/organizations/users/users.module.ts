import { Module } from '@nestjs/common';
import { UserController } from './infraestructure/web/controllers/user.controller';
import { UserRepositoryImpl } from './infraestructure/adapters/persistence/repository/user-impl.repository';
import { UserService } from './application/services/user.service';
import { UserEntity } from './infraestructure/adapters/persistence/entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersistenceModule } from '@app/persistence/persistence.module';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserRepositoryImpl, UserService]
})
export class UsersModule {}

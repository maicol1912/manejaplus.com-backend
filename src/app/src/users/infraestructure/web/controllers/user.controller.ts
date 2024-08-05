import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { SqlGlobalMapper } from '@app/shared/mappers/sql.mapper';
import { UserService } from '@app/users/application/services/user.service';
import { UserModel } from '@app/users/domain/models/user.model';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  public async createUser(@Body() createUserDto: CreateUserDto) {
    const create = await this.userService.createUser(
      SqlGlobalMapper.mapClassMethod<CreateUserDto, UserModel>(createUserDto, UserModel)
    );
    return create;
  }

  @Post('unlock-account')
  public async unlockAccount(@Body() createUserDto: CreateUserDto) {
    const create = await this.userService.createUser(
      SqlGlobalMapper.mapClassMethod<CreateUserDto, UserModel>(createUserDto, UserModel)
    );
    return create;
  }
}

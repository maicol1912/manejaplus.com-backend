import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserModel } from '../models/user.model';
import { UserService } from '../services/user.service';
import { SqlGlobalMapper } from 'src/modules/common/data/mappers/sql.mapper';


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

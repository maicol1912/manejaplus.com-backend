import { UserUseCase } from '@app/organizations/users/application/usecases/user.use-case';
import { Controller, Post, Body, HttpStatus, HttpException, HttpCode } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { SqlGlobalMapper } from '@app/shared/mappers/sql.mapper';
import { UserModel } from '@app/organizations/users/domain/models/user.model';
import { UserService } from '@app/organizations/users/application/services/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  public async createUser(@Body() createUserDto: CreateUserDto) {
    const create = await this.userService.createUser(
      SqlGlobalMapper.mapClassMethos<CreateUserDto, UserModel>(createUserDto, {}, UserModel)
    );
    return create;
  }
}

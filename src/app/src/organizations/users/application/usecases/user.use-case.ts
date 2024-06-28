import { UserModel } from '../../domain/models/user.model';

export abstract class UserUseCase {
  abstract createUser(userModel: UserModel): Promise<any>;
}

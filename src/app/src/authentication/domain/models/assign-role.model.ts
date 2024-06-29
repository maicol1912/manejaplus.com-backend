import { RoleModel } from './role.model';

export class AssignRoleModel {
  public userId: string;
  public rolesId: string[];
  public roles: RoleModel[];
}

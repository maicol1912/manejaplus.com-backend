import { PermissionModel } from './permission.model';

export class RoleModel {
  public name: string;
  public description: string;
  public permissionsId?: string[];
  public permissions: PermissionModel[];
}

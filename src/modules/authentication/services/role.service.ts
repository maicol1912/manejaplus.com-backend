import { Injectable } from "@nestjs/common";
import { RoleModel } from "../models/role.model";
import { PermissionService } from "./permission.service";
import { RoleEntity } from "@persistence/entities/public/role.entity";
import { PermissionRepository } from "@persistence/repositories/permission.repository";
import { RoleRepository } from "@persistence/repositories/role.repository";
import { SqlGlobalMapper } from "src/modules/common/data/mappers/sql.mapper";

@Injectable()
export class RoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionService: PermissionService,
    private readonly permissionRepository: PermissionRepository
  ) {}

  public async createRole(roleModel: RoleModel): Promise<Partial<RoleModel>> {
    const permissions = await this.permissionRepository.findPermissionsByIdsAndActive(roleModel.permissionsId);
    this.permissionService.validatePermissions(permissions, roleModel.permissionsId);

    roleModel.permissions = permissions;

    return SqlGlobalMapper.mapClass<RoleEntity, RoleModel>(
      await this.roleRepository.save(
        SqlGlobalMapper.mapClass<RoleModel, RoleEntity>(roleModel)
      ),
      { get: ['name', 'description'] }
    );
  }

  public validateRoles(roles: RoleEntity[], rolesId: string[]): void {
    if (roles.length !== rolesId.length) {
      throw new Error('At least one role is not allowed');
    }
  }

  public findManyByField(query:any){
    return this.roleRepository.findManyByField(query)
  }

  public findRolesByIds(ids:string[]){
    return this.roleRepository.findByIds(ids)
  }

}
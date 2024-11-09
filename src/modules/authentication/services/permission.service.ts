import { Injectable } from "@nestjs/common";
import { PermissionModel } from "../models/permission.model";
import { PermissionRepository } from "@persistence/repositories/permission.repository";
import { SqlGlobalMapper } from "src/modules/common/data/mappers/sql.mapper";
import { PermissionEntity } from "@persistence/entities/public/permission.entity";

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  public async createPermission(permissionModel: PermissionModel): Promise<PermissionModel> {
    const permissionEntity = SqlGlobalMapper.mapClass<PermissionModel, PermissionEntity>(
      permissionModel
    );

    const createdPermission = await this.permissionRepository.save(permissionEntity);
    return SqlGlobalMapper.mapClass<PermissionEntity, PermissionModel>(createdPermission);
  }

  public validatePermissions(permissions: PermissionEntity[], permissionsId: string[]): void {
    if (permissions.length !== permissionsId.length) {
      throw new Error('At least one permission is not allowed');
    }
  }
}
import { PermissionEntity } from '@app/authentication/infraestructure/adapters/persistence/entity/permission.entity';
import { RoleEntity } from '@app/authentication/infraestructure/adapters/persistence/entity/role.entity';
import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

@Injectable()
export class AuthRepositoryImpl {
  private permissionRepo: Repository<PermissionEntity>;
  private roleRepo: Repository<RoleEntity>;

  constructor(@InjectDataSource() private dataSource: DataSource) {
    this.permissionRepo = this.dataSource.getRepository(PermissionEntity);
    this.roleRepo = this.dataSource.getRepository(RoleEntity);
  }

  public async createPermission(permissionEntity: PermissionEntity): Promise<PermissionEntity> {
    return await this.permissionRepo.save(permissionEntity);
  }

  public async createRole(roleEntity: RoleEntity): Promise<RoleEntity> {
    return await this.roleRepo.save(roleEntity);
  }

  public async findPermissionsByIds(ids: string[]): Promise<PermissionEntity[]> {
    const permissions = await this.permissionRepo.findBy({
      id: In(ids),
      status: true
    });
    return permissions;
  }

  public async findRolesByIds(ids: string[]): Promise<RoleEntity[]> {
    const roles = await this.roleRepo.findBy({
      id: In(ids),
      status: true
    });
    return roles;
  }

  public async updateRole(id: string, roleEntity: Partial<RoleEntity>): Promise<RoleEntity> {
    return this.roleRepo.save({ ...roleEntity, id });
  }
}

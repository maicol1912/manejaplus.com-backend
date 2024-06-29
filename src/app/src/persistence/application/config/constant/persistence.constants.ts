import { PermissionEntity } from '@app/authentication/infraestructure/adapters/persistence/entity/permission.entity';
import { RoleEntity } from '@app/authentication/infraestructure/adapters/persistence/entity/role.entity';
import { OrganizationEntity } from '@app/organizations/infraestructure/persistence/entity/organization.entity';
import { TenantEntity } from '@app/persistence/infraestructure/adapters/persistence/entity/tenant.entity';
import { UserEntity } from '@app/users/infraestructure/adapters/persistence/entity/user.entity';

const ENTITIES_SCHEMA_PUBLIC = [
  UserEntity,
  TenantEntity,
  RoleEntity,
  PermissionEntity,
  OrganizationEntity
];

export const PERSISTENCE_CONSTANTS = { ENTITIES_SCHEMA_PUBLIC };

import { PermissionEntity } from '@app/authentication/infraestructure/adapters/persistence/entity/permission.entity';
import { RoleEntity } from '@app/authentication/infraestructure/adapters/persistence/entity/role.entity';
import { UserEntity } from '@app/organizations/users/infraestructure/adapters/persistence/entity/user.entity';
import { TenantEntity } from '@app/persistence/infraestructure/adapters/persistence/entity/tenant.entity';

const ENTITIES_SCHEMA_PUBLIC = [UserEntity, TenantEntity, RoleEntity, PermissionEntity];

export const PERSISTENCE_CONSTANTS = { ENTITIES_SCHEMA_PUBLIC };

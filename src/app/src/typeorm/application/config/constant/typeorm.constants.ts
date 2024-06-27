import { PermissionEntity } from '@app/authentication/infraestructure/adapters/persistence/entity/permission.entity';
import { RoleEntity } from '@app/authentication/infraestructure/adapters/persistence/entity/role.entity';
import { UserEntity } from '@app/organizations/users/infraestructure/adapters/persistence/entity/user.entity';
import { TenantEntity } from '@app/typeorm/infraestructure/adapters/persistence/entity/tenant.entity';

const ENTITIES_SCHEMA_PUBLIC = [UserEntity, TenantEntity, RoleEntity, PermissionEntity];

export { ENTITIES_SCHEMA_PUBLIC };

import { OrganizationEntity } from "@persistence/entities/public/organization.entity";
import { OtpEntity } from "@persistence/entities/public/otp.entity";
import { PermissionEntity } from "@persistence/entities/public/permission.entity";
import { RoleEntity } from "@persistence/entities/public/role.entity";
import { TenantEntity } from "@persistence/entities/public/tenant.entity";
import { UserEntity } from "@persistence/entities/public/user.entity";


const ENTITIES_SCHEMA_PUBLIC = [
  UserEntity,
  TenantEntity,
  RoleEntity,
  PermissionEntity,
  OrganizationEntity,
  OtpEntity,
];

export const PERSISTENCE_CONSTANTS = { ENTITIES_SCHEMA_PUBLIC };

import { Module } from "@nestjs/common";
import { CategoryRepository } from "./repositories/category.repository";
import { OrganizationRepository } from "./repositories/organization.repository";
import { OtpRepository } from "./repositories/otp.repository";
import { PermissionRepository } from "./repositories/permission.repository";
import { ProductRepository } from "./repositories/product.repository";
import { RoleRepository } from "./repositories/role.repository";
import { TenantRepository } from "./repositories/tenant.repository";
import { UserRepository } from "./repositories/user.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TenantService } from "./core/services/tenant.service";
import { TypeOrmConfigService } from "./config/persistence.config";


@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    TypeOrmModule.forFeature([
      
    ]),
  ],
  controllers: [],
  providers: [
    CategoryRepository,
    OrganizationRepository,
    OtpRepository,
    PermissionRepository,
    ProductRepository,
    RoleRepository,
    TenantRepository,
    UserRepository,
    TenantService
  ],
  exports: [
    PersistenceModule,
    CategoryRepository,
    OrganizationRepository,
    OtpRepository,
    PermissionRepository,
    ProductRepository,
    RoleRepository,
    TenantRepository,
    UserRepository,
    TenantService
  ],
})
export class PersistenceModule {}

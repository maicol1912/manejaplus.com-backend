// src/core/services/tenant.service.ts
import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { TenantEntity } from '@persistence/entities/public/tenant.entity';
import { TenantRepository } from '@persistence/repositories/tenant.repository';
import { TenantModel } from '../models/tenant.model';
import { SqlGlobalMapper } from 'src/modules/common/data/mappers/sql.mapper';
import { UUIDEncoder } from 'src/modules/common/utils/encryptors/uuid';
import * as path from 'path';
import { getTypeOrmConfig } from '@persistence/config/persistence.config';

interface TenantCreationResult {
  id: string;
  name: string;
  schema: string;
}

@Injectable()
export class TenantService {
  private readonly BASE_ENTITIES_PATH = path.join(__dirname, '../../persistence/entities/custom');

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly tenantRepository: TenantRepository
  ) {}

  public async createTenantClient(tenantModel: TenantModel): Promise<TenantCreationResult> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generar nombre único para el schema
      const UUID = UUIDEncoder();
      const schemaName = `${tenantModel.name.toLowerCase()}_${UUID}`;
      tenantModel.name = schemaName;

      // Verificar si el schema existe
      const schemaExists = await this.checkSchemaExists(schemaName);
      if (schemaExists) {
        throw new ConflictException(`Schema "${schemaName}" already exists`);
      }

      // Crear el tenant en la base de datos
      const tenantEntity = SqlGlobalMapper.mapClass<TenantModel, TenantEntity>(tenantModel);
      const tenantCreated = await this.tenantRepository.save(tenantEntity);

      if (!tenantCreated) {
        throw new InternalServerErrorException('Failed to create tenant record');
      }

      // Crear y configurar el schema del tenant
      await this.createTenantSchema(schemaName);

      // Crear las tablas del tenant
      await this.initializeTenantSchema(schemaName);

      await queryRunner.commitTransaction();

      return {
        id: tenantCreated.id,
        name: tenantCreated.name,
        schema: schemaName
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      // Limpiar en caso de error
      await this.cleanupFailedTenantCreation(tenantModel.name);
      
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to create tenant: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  public async deleteTenantClient(tenantId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Obtener el tenant
      const tenant = await this.tenantRepository.findByField({id: tenantId });
      if (!tenant) {
        throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
      }

      if (tenant.name.toLowerCase() === 'public') {
        throw new ConflictException('Cannot delete public schema');
      }

      // Eliminar todas las tablas del schema
      await this.dropTenantSchema(tenant.name);
      
      // Eliminar el registro del tenant
      await this.tenantRepository.delete(tenant.id);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to delete tenant: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  private async createTenantSchema(schemaName: string): Promise<void> {
    await this.dataSource.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
  }

  private async initializeTenantSchema(schemaName: string): Promise<void> {
    try {
      await this.dataSource.query(`SET search_path TO "${schemaName}"`);

      const tenantConfig = {
        ...getTypeOrmConfig(schemaName),
        entities: [path.join(this.BASE_ENTITIES_PATH, '**', '*.entity{.ts,.js}')]
      } as DataSourceOptions;

      const tenantDataSource = new DataSource(tenantConfig);
      await tenantDataSource.initialize();
      await tenantDataSource.synchronize(true);
      await tenantDataSource.destroy();

      await this.dataSource.query(`SET search_path TO "public"`);
    } catch (error) {
      await this.dataSource.query(`SET search_path TO "public"`);
      throw error;
    }
  }

  private async dropTenantSchema(schemaName: string): Promise<void> {
    await this.dataSource.query(`
      DO $$ 
      DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = '${schemaName}') LOOP
          EXECUTE 'DROP TABLE IF EXISTS "${schemaName}"."' || r.tablename || '" CASCADE';
        END LOOP;
      END $$;
    `);

    await this.dataSource.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
  }

  private async checkSchemaExists(schemaName: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name = $1`,
      [schemaName]
    );
    return parseInt(result[0].count) > 0;
  }

  private async cleanupFailedTenantCreation(schemaName: string): Promise<void> {
    try {
      await this.dropTenantSchema(schemaName);
      await this.tenantRepository.delete("");
    } catch (error) {
      // Log error but don't throw as this is cleanup
      console.error('Failed to cleanup failed tenant creation:', error);
    }
  }

  // Métodos adicionales útiles
  public async getTenantByName(name: string): Promise<TenantEntity> {
    const tenant = await this.tenantRepository.findByField({ name });
    if (!tenant) {
      throw new NotFoundException(`Tenant "${name}" not found`);
    }
    return tenant;
  }

  public async listTenants(): Promise<TenantEntity[]> {
    return this.tenantRepository.findAll();
  }

  public async validateTenantAccess(tenantId: string): Promise<boolean> {
    const tenant = await this.tenantRepository.findByField({ 
        id: tenantId,
        isActive: true 
    });
    return !!tenant;
  }
}
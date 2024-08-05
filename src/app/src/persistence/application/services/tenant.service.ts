import { Injectable } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { getMetadataArgsStorage } from 'typeorm';
import { PERSISTENCE_CONSTANTS } from '../config/constant/persistence.constants';
import { UUIDEncoder } from '@app/shared/encryption/uuid.encoder';
import { TenantRepositoryImpl } from '@app/persistence/infraestructure/adapters/persistence/repository/tenant.repository';
import { SqlGlobalMapper } from '@app/shared/mappers/sql.mapper';
import { TenantModel } from '@app/persistence/domain/models/tenant.model';
import { TenantEntity } from '@app/persistence/infraestructure/adapters/persistence/entity/tenant.entity';

@Injectable()
export class TenantService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private tenantRepository: TenantRepositoryImpl
  ) {}

  public async createTenantClient(tenantModel: TenantModel): Promise<string | null> {
    try {
      const UUID = UUIDEncoder();
      tenantModel.name = `${tenantModel.name}_${UUID}`;
      const tenantCreated = await this.tenantRepository.createTenant(
        SqlGlobalMapper.mapClass<TenantModel, TenantEntity>(tenantModel)
      );

      if (tenantCreated) {
        const schemaExists = await this.checkSchemaToCreateExists(tenantModel.name);
        if (schemaExists) {
          throw new Error(`The schema "${tenantModel.name}" already exists`);
        }

        const entitiesToLoadInClientSchema = this.loadEntitiesInSchemaClient();
        await this.dataSource.query(`CREATE SCHEMA IF NOT EXISTS "${tenantModel.name}"`);

        await this.dataSource.query(`SET search_path TO "${tenantModel.name}"`);

        const clientDataSource = new DataSource({
          ...this.dataSource.options,
          schema: tenantModel.name,
          entities: entitiesToLoadInClientSchema,
        } as DataSourceOptions);

        await clientDataSource.initialize();
        await clientDataSource.synchronize(true);

        await clientDataSource.destroy();

        await this.dataSource.query(`SET search_path TO "public"`);
        return tenantCreated.id;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  public async deleteSchemaClient(schemaName: string): Promise<string | null> {
    try {
      if (schemaName.toLowerCase() === 'public') {
        throw new Error('No se puede eliminar el esquema public');
      }

      await this.dataSource.query(`
        DO $$ DECLARE
          r RECORD;
        BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = '${schemaName}') LOOP
            EXECUTE 'DROP TABLE IF EXISTS "${schemaName}"."' || r.tablename || '" CASCADE';
          END LOOP;
        END $$;
      `);

      await this.dataSource.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
      return schemaName;
    } catch (error) {
      return null;
    }
  }

  public loadEntitiesInSchemaClient(): Function[] {
    try {
      const metadataArgsStorage = getMetadataArgsStorage();
      const entityMetadatas = metadataArgsStorage.tables;

      const entities = entityMetadatas
        .filter((metadata) => metadata.target instanceof Function)
        .map((metadata) => metadata.target as Function);

      const entitiesToExcludeInClientSchema = PERSISTENCE_CONSTANTS.ENTITIES_SCHEMA_PUBLIC.map(
        (entity) => {
          const classString = entity.toString();
          const match = classString.match(/class\s+(\w+)/);
          return match ? match[1] : '';
        }
      );

      return entities.filter((entity) => !entitiesToExcludeInClientSchema.includes(entity.name));
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  static loadEntitiesInSchemaPublic(): Function[] {
    try {
      const metadataArgsStorage = getMetadataArgsStorage();
      const entityMetadatas = metadataArgsStorage.tables;

      const entities = entityMetadatas
        .filter((metadata) => metadata.target instanceof Function)
        .map((metadata) => metadata.target as Function);

      const entitiesToExcludeInClientSchema = PERSISTENCE_CONSTANTS.ENTITIES_SCHEMA_PUBLIC.map(
        (entity) => {
          const classString = entity.toString();
          const match = classString.match(/class\s+(\w+)/);
          return match ? match[1] : '';
        }
      );

      return entities.filter((entity) => entitiesToExcludeInClientSchema.includes(entity.name));
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  private async checkSchemaToCreateExists(schemaName: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
      SELECT COUNT(*) 
      FROM information_schema.schemata 
      WHERE schema_name = $1
    `,
      [schemaName]
    );

    return parseInt(result[0].count) > 0;
  }
}

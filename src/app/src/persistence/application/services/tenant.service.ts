import { Injectable } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { getMetadataArgsStorage } from 'typeorm';
import { PERSISTENCE_CONSTANTS } from '../config/constant/persistence.constants';

@Injectable()
export class TenantService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  public async createSchemaClient(schemaName: string) {
    const schemaExists = await this.checkSchemaToCreateExists(schemaName);
    if (schemaExists) {
      throw new Error(`The schema "${schemaName}" already exists`);
    }

    const entitiesToLoadInClientSchema = this.loadEntitiesInSchemaClient();
    await this.dataSource.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

    await this.dataSource.query(`SET search_path TO "${schemaName}"`);

    const clientDataSource = new DataSource({
      ...this.dataSource.options,
      schema: schemaName,
      entities: entitiesToLoadInClientSchema
    } as DataSourceOptions);

    await clientDataSource.initialize();
    await clientDataSource.synchronize(true);

    await clientDataSource.destroy();

    await this.dataSource.query(`SET search_path TO "public"`);
  }

  public async deleteSchemaClient(schemaName: string) {
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
  }

  public loadEntitiesInSchemaClient(): Function[] {
    try {
      const metadataArgsStorage = getMetadataArgsStorage();
      const entityMetadatas = metadataArgsStorage.tables;

      const entities = entityMetadatas
        .filter(metadata => metadata.target instanceof Function)
        .map(metadata => metadata.target as Function);

      const entitiesToExcludeInClientSchema = PERSISTENCE_CONSTANTS.ENTITIES_SCHEMA_PUBLIC.map(
        entity => {
          const classString = entity.toString();
          const match = classString.match(/class\s+(\w+)/);
          return match ? match[1] : '';
        }
      );

      return entities.filter(entity => !entitiesToExcludeInClientSchema.includes(entity.name));
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
        .filter(metadata => metadata.target instanceof Function)
        .map(metadata => metadata.target as Function);

      const entitiesToExcludeInClientSchema = PERSISTENCE_CONSTANTS.ENTITIES_SCHEMA_PUBLIC.map(
        entity => {
          const classString = entity.toString();
          const match = classString.match(/class\s+(\w+)/);
          return match ? match[1] : '';
        }
      );

      return entities.filter(entity => entitiesToExcludeInClientSchema.includes(entity.name));
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

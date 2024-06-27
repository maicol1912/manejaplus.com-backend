import { Injectable } from '@nestjs/common';
import { DataSource, DataSourceOptions, EntityMetadata } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import * as typeormConstant from '../config/constant/typeorm.constants';
import * as glob from 'glob';
import { getMetadataArgsStorage } from 'typeorm';

@Injectable()
export class SchemaService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createSchemaClient(schemaName: string) {
    const entitiesToLoadInClientSchema = this.loadEntitiesInSchemaClient();
    console.log('entities', entitiesToLoadInClientSchema);
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

  async deleteSchemaClient(schemaName: string) {
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

  loadEntitiesInSchemaClient(): Function[] {
    try {
      const metadataArgsStorage = getMetadataArgsStorage();
      const entityMetadatas = metadataArgsStorage.tables;

      const entities = entityMetadatas
        .filter(metadata => metadata.target instanceof Function)
        .map(metadata => metadata.target as Function);

      const entitiesToExcludeInClientSchema = typeormConstant.ENTITIES_SCHEMA_PUBLIC.map(entity => {
        const classString = entity.toString();
        const match = classString.match(/class\s+(\w+)/);
        return match ? match[1] : '';
      });

      return entities.filter(entity => !entitiesToExcludeInClientSchema.includes(entity.name));
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}

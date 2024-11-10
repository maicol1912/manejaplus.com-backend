import { Injectable } from "@nestjs/common";
import { getTypeOrmConfig } from "@persistence/config/persistence.config";
import { OrganizationEntity } from "@persistence/entities/public/organization.entity";
import * as path from "path";
import { UUIDEncoder } from "src/modules/common/utils/encryptors/uuid";
import { DataSource, EntityTarget } from "typeorm";
import * as fs from 'fs';
import * as glob from 'glob';

const BASE_DIR = path.join(__dirname, '..', '..', 'persistence', 'entities');

@Injectable()
export class TenantService {
  constructor(private readonly dataSource: DataSource) {}

  private async loadCustomEntities(): Promise<EntityTarget<any>[]> {
    const customEntitiesPath = path.join(BASE_DIR, 'custom');
    const entityFiles = glob.sync(path.join(customEntitiesPath, '**', '*.entity.{ts,js}'));
    
    const entities: EntityTarget<any>[] = [];
    for (const file of entityFiles) {
      try {
        // Importar dinámicamente cada entidad
        const entityModule = await import(file);
        // Obtener la primera clase exportada del módulo
        const entityClass = Object.values(entityModule)[0] as EntityTarget<any>;
        
        // Verificar si es una clase válida de TypeORM
        if (typeof entityClass === 'function') {
          entities.push(entityClass);
        }
      } catch (error) {
        console.error(`Error loading entity from file ${file}:`, error);
      }
    }
    return entities;
  }

  async createTenant(): Promise<string> {
    const tenantId = `tenant_${UUIDEncoder().replace(/-/g, '_')}`;
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Crear el nuevo schema
      await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "${tenantId}"`);

      // Cargar todas las entidades custom
      const customEntities = await this.loadCustomEntities();
      
      if (customEntities.length === 0) {
        console.warn('No se encontraron entidades custom para crear en el tenant');
      }

      // Crear una conexión específica para el tenant
      const tenantConnection = await this.getTenantConnection(tenantId, customEntities);

      try {
        // Crear las tablas en el nuevo schema
        await Promise.all(
          customEntities.map(async (entity) => {
            const metadata = tenantConnection.getMetadata(entity);
            const tableName = metadata.tableName;
            const tableSchema = await tenantConnection.query(
              `SELECT to_regclass('"${tenantId}"."${tableName}"') as exists`
            );
            
            if (!tableSchema[0].exists) {
              await tenantConnection.synchronize(false);
            }
          })
        );

      } finally {
        // Cerrar la conexión del tenant
        await tenantConnection.destroy();
      }

      await queryRunner.commitTransaction();
      return tenantId;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTenantConnection(tenantId: string, entities: EntityTarget<any>[]): Promise<DataSource> {
    const config = {
      ...getTypeOrmConfig(tenantId),
      entities: entities, // Usar las entidades cargadas dinámicamente
    };

    const connection = new DataSource(config as any);
    await connection.initialize();
    return connection;
  }
}
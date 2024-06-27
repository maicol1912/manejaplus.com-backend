/*import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm'; // Suponiendo que tienes un repositorio para manejar usuarios
import { getConnection } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    private readonly schemaService: SchemaService,
    private readonly userRepository: UserRepository,
    private readonly entityManager: EntityManager // Inyecta el EntityManager
  ) {}

  async createUser(username: string): Promise<void> {
    const schemaName = username.toLowerCase(); // Utiliza un nombre de esquema basado en el usuario

    // Crea el esquema si no existe
    await this.schemaService.createSchema(schemaName);

    // Ejecuta la sincronización de las entidades en el nuevo esquema
    await this.syncEntitiesWithSchema(schemaName);

    // Guarda el usuario en la base de datos principal (sin especificar esquema)
    await this.userRepository.save({ username, schema: schemaName });
  }

  async syncEntitiesWithSchema(schemaName: string): Promise<void> {
    // Obtiene la conexión actual
    const connection = getConnection();

    // Establece el contexto de la migración para el nuevo esquema
    connection.options.context = schemaName;

    // Sincroniza las entidades con el nuevo esquema
    await connection.synchronize(); // Opcionalmente puedes usar `runMigrations` si prefieres migraciones controladas

    // Restaura el contexto de la conexión
    connection.options.context = 'default';
  }

  async deleteUser(username: string): Promise<void> {
    const schemaName = username.toLowerCase(); // Obtén el nombre de esquema basado en el usuario

    // Elimina el esquema asociado al usuario
    await this.schemaService.dropSchema(schemaName);

    // Elimina el usuario de la base de datos principal
    await this.userRepository.delete({ username });
  }

  // Otros métodos para actualizar usuarios, obtener usuarios, etc.
}

@Injectable()
export class SchemaService {
  constructor(private readonly entityManager: EntityManager) {}

  async createSchema(schemaName: string): Promise<void> {
    await this.entityManager.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
  }

  async dropSchema(schemaName: string): Promise<void> {
    await this.entityManager.query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);
  }
}
*/

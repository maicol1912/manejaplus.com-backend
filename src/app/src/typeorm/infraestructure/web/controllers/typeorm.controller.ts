import { SchemaService } from '@app/typeorm/application/services/schema.service';
import { Controller, Post, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';

@Controller('typeorm')
export class TypeOrmController {
  constructor(private schemaService: SchemaService) {}

  @Post('schema')
  async createSchema(@Body('schemaName') schemaName: string) {
    try {
      await this.schemaService.createSchemaClient(schemaName);
      return { message: `Schema ${schemaName} created successfully` };
    } catch (error) {
      throw new HttpException('Failed to create schema', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('schema/:schemaName')
  async deleteSchema(@Param('schemaName') schemaName: string) {
    try {
      await this.schemaService.deleteSchemaClient(schemaName);
      return { message: `Schema ${schemaName} deleted successfully` };
    } catch (error) {
      if (error.message === 'No se puede eliminar el esquema public') {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Failed to delete schema', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

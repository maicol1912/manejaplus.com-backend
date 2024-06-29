import { TenantService } from '@app/persistence/application/services/tenant.service';
import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  HttpException,
  HttpStatus,
  Inject
} from '@nestjs/common';

@Controller('persistence')
export class PersistenceController {
  constructor(@Inject(TenantService) private tenantService: TenantService) {}
  @Delete('schema/:schemaName')
  async deleteSchema(@Param('schemaName') schemaName: string) {
    try {
      await this.tenantService.deleteSchemaClient(schemaName);
      return { message: `Schema ${schemaName} deleted successfully` };
    } catch (error) {
      if (error.message === 'No se puede eliminar el esquema public') {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Failed to delete schema', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

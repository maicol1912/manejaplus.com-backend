import { Module } from '@nestjs/common';
import { SchemaService } from './application/services/schema.service';
import { TypeOrmController } from './infraestructure/web/controllers/typeorm.controller';

@Module({
  imports: [],
  controllers: [TypeOrmController],
  providers: [SchemaService]
})
export class TypeormConnectionModule {}

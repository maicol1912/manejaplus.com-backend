import { Module } from '@nestjs/common';
import { ProductEntity } from './infraestructure/adapters/persistence/entity/product.entity';
import { CategoryEntity } from './infraestructure/adapters/persistence/entity/category.entity';

@Module({
  imports: [],
  controllers: [],
  providers: [ProductEntity, CategoryEntity],
  exports: []
})
export class ProductsModule {}

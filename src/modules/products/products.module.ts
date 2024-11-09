import { Module } from '@nestjs/common';
import { CategoryEntity } from '@persistence/entities/custom/category.entity';
import { ProductEntity } from '@persistence/entities/custom/product.entity';


@Module({
  imports: [],
  controllers: [],
  providers: [ProductEntity, CategoryEntity],
  exports: []
})
export class ProductsModule {}

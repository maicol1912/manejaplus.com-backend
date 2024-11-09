import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CategoryEntity } from '../entities/custom/category.entity';
import { BaseRepository } from '../core/base.repository';


@Injectable()
export class CategoryRepository extends BaseRepository<CategoryEntity, 'code'> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, CategoryEntity, 'code');
  }
}

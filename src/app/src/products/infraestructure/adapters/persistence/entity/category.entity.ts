import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'mps_category' })
class CategoryEntity {
  @PrimaryColumn({ length: 3 })
  private code: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  private name: string;

  @Column({ type: 'text', nullable: false })
  private description: string;

  @Column({ type: 'boolean', default: true, nullable: false })
  private status: boolean;
}

export { CategoryEntity };

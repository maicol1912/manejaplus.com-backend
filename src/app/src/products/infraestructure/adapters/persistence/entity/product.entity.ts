import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'product' })
class ProductEntity {
  @PrimaryGeneratedColumn()
  private id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  private name: string;

  @Column({ type: 'text', nullable: false })
  private description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  private price: number;

  @Column({ type: 'int', nullable: false })
  private stock: number;

  @Column({ type: 'text', nullable: true })
  private image: string;

  @Column({ type: 'boolean', default: true, nullable: false })
  private status: boolean;
}

export { ProductEntity };

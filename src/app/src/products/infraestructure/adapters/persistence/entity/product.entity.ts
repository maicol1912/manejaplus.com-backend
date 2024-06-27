import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity({ name: 'mps_product' })
export class ProductEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  public name: string;

  @Column({ type: 'text', nullable: false })
  public description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  public price: number;

  @Column({ type: 'int', nullable: false })
  public stock: number;

  @Column({ type: 'text', nullable: true })
  public image: string;

  @Column({ type: 'boolean', default: true, nullable: false })
  public status: boolean;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}

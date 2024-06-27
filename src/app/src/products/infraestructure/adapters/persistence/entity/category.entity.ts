import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'mps_category' })
export class CategoryEntity {
  @PrimaryColumn({ length: 3 })
  public code: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  public name: string;

  @Column({ type: 'text', nullable: false })
  public description: string;

  @Column({ type: 'boolean', default: true, nullable: false })
  public status: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

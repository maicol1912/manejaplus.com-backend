import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity({ schema: 'public', name: 'mps_role' })
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ unique: true, nullable: false, type: 'varchar', length: 50 })
  public name: string;

  @Column({ nullable: false, type: 'varchar', length: 200 })
  public description: string;

  @Column({ default: true, nullable: false })
  public status: boolean;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}

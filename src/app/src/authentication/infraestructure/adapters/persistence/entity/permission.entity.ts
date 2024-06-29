import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { RoleEntity } from './role.entity';

@Entity({ schema: 'public', name: 'mps_permission' })
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'permission_id' })
  public id: number;

  @Column({ unique: true, nullable: false, type: 'varchar', length: 50, name: 'permission_name' })
  public name: string;

  @Column({ nullable: false, type: 'varchar', length: 200, name: 'permission_description' })
  public description: string;

  @Column({ default: true, nullable: false, name: 'permission_status' })
  public status: boolean;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}

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
class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ unique: true, nullable: false, type: 'varchar', length: 50 })
  name: string;

  @Column({ nullable: false, type: 'varchar', length: 200 })
  description: string;

  @ManyToMany(() => RoleEntity, role => role.id)
  roles: RoleEntity[];

  @Column({ default: true, nullable: false })
  status: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export { PermissionEntity };

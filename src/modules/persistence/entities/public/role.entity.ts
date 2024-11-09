import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinTable,
  ManyToMany
} from 'typeorm';
import { PermissionEntity } from './permission.entity';

@Entity({ schema: 'public', name: 'mps_role' })
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'role_id' })
  public id: string;

  @Column({ unique: true, nullable: false, type: 'varchar', length: 50, name: 'role_name' })
  public name: string;

  @Column({ nullable: false, type: 'varchar', length: 200, name: 'role_description' })
  public description: string;

  @ManyToMany(() => PermissionEntity)
  @JoinTable({
    name: 'mps_role_permissions',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id'
    }
  })
  permissions: PermissionEntity[];

  @Column({ default: true, nullable: false, name: 'role_status' })
  public status: boolean;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}

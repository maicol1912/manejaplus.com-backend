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
  @PrimaryGeneratedColumn('uuid')
  public id: number;

  @Column({ unique: true, nullable: false, type: 'varchar', length: 50 })
  public name: string;

  @Column({ nullable: false, type: 'varchar', length: 200 })
  public description: string;

  @ManyToMany(() => RoleEntity, role => role.id)
  public roles: RoleEntity[];

  @Column({ default: true, nullable: false })
  public status: boolean;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}

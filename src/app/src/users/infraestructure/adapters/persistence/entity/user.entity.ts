import { RoleEntity } from '@app/authentication/infraestructure/adapters/persistence/entity/role.entity';
import { OrganizationEntity } from '@app/organizations/infraestructure/persistence/entity/organization.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable
} from 'typeorm';

@Entity({ schema: 'public', name: 'mps_user' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  public name: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  public email: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  public password: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  public phone: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  public otp: string;

  @Column({ type: 'int', default: 0, nullable: true })
  public attemptsFailed: number;

  @Column({ type: 'boolean', default: false, nullable: true })
  public isVerified: boolean;

  @Column({ type: 'boolean', default: true, nullable: true })
  public isBlocked: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  public accessToken: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  public refreshToken: string;

  @Column({ type: 'boolean', default: true, nullable: false })
  public status: boolean;

  @ManyToOne(() => OrganizationEntity, organization => organization.users, { nullable: true })
  @JoinColumn({ name: 'organization' })
  public organization: OrganizationEntity | null;

  @ManyToMany(() => RoleEntity)
  @JoinTable({
    name: 'mps_user_role',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id'
    }
  })
  public roles: RoleEntity[];

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}

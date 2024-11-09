
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { UserEntity } from './user.entity';
import { TenantEntity } from './tenant.entity';

@Entity({ schema: 'public', name: 'mps_organization' })
export class OrganizationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  name: string;

  @OneToMany(() => UserEntity, user => user.organization)
  users: UserEntity[];

  @Column({ unique: true, nullable: true })
  image_url: string;

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'owner' })
  owner: UserEntity;

  @ManyToOne(() => TenantEntity, { nullable: false })
  @JoinColumn({ name: 'tenant' })
  tenant: TenantEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

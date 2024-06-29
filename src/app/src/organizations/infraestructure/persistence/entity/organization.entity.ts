import { TenantEntity } from '@app/persistence/infraestructure/adapters/persistence/entity/tenant.entity';
import { UserEntity } from '@app/users/infraestructure/adapters/persistence/entity/user.entity';
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

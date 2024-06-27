import { UserEntity } from '@app/organizations/users/infraestructure/adapters/persistence/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity({ schema: 'public', name: 'mps_tenant' })
class TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  tenant_name: string;

  @Column({ default: true, nullable: false })
  status: boolean;

  @ManyToOne(() => UserEntity, user => user.id)
  user: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export { TenantEntity };

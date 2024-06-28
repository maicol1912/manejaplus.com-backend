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
export class TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ unique: true, nullable: false })
  public tenant_name: string;

  @Column({ default: true, nullable: false })
  public status: boolean;

  @ManyToOne(() => UserEntity, user => user.id)
  public user: UserEntity;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}

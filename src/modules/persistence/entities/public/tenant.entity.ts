
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ schema: 'public', name: 'mps_tenant' })
export class TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ unique: true, nullable: false })
  public name: string;

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'owner' })
  public owner: UserEntity;

  @Column({ default: true, nullable: false })
  public status: boolean;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}

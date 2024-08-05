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
  JoinTable,
} from 'typeorm';
import { UserEntity } from './user.entity';

export enum TYPE_OTP {
  LOGIN_OTP = 'LOGIN_OTP',
  PURCHASE_OTP = 'PURCHASE_OTP',
}

@Entity({ schema: 'public', name: 'msp_otp_user' })
export class OtpEntity {
  @PrimaryGeneratedColumn('identity')
  public id: string;

  @Column({ type: 'varchar', nullable: false, unique: false })
  public otp: string;

  @Column({ enum: TYPE_OTP, nullable: false, unique: false })
  public typeOtp: TYPE_OTP;

  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn({ name: 'user' })
  public user: UserEntity;

  @Column({ type: 'boolean', nullable: false, unique: false, default: false })
  public wasUsed: boolean;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}

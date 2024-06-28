import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity({ schema: 'public', name: 'mps_user' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: number;

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

  @Column({ default: true, nullable: false })
  public status: boolean;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}

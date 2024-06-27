import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'varchar', length: 100 })
  public name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  public email: string;

  @Column({ type: 'varchar', length: 100 })
  public password: string;

  @Column({ type: 'varchar', length: 20 })
  public phone: string;

  @Column({ type: 'varchar', length: 10 })
  public otp: string;

  @Column({ type: 'int', default: 0 })
  public attemptsFailed: number;

  @Column({ type: 'boolean', default: false })
  public isVerified: boolean;

  @Column({ type: 'boolean', default: false })
  public isBlocked: boolean;

  @Column({ default: true, nullable: false })
  public status: boolean;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}

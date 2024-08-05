import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BaseRepository } from '@app/persistence/infraestructure/adapters/persistence/repository/base.repository';
import { OtpEntity, TYPE_OTP } from '../entity/otp.entity';
import { Uuid } from '@elastic/elasticsearch/lib/api/types';

@Injectable()
export class OtpRepositoryImpl extends BaseRepository<OtpEntity> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, OtpEntity);
  }

  public async save(otpEntity: OtpEntity): Promise<OtpEntity> {
    return this.getManager().save(OtpEntity, otpEntity);
  }

  public async findByType(type: TYPE_OTP, userId: string): Promise<OtpEntity | null> {
    return await this.getManager().findOne(OtpEntity, {
      where: { typeOtp: type, user: { id: userId } },
      order: { createdAt: 'DESC' }
    });
  }
}

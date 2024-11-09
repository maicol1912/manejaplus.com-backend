import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CategoryEntity } from '../entities/custom/category.entity';
import { BaseRepository } from '../core/base.repository';
import { OrganizationEntity } from '../entities/public/organization.entity';
import { OtpEntity, TYPE_OTP } from '../entities/public/otp.entity';


@Injectable()
export class OtpRepository extends BaseRepository<OtpEntity, 'id'> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(dataSource, OtpEntity, 'id');
  }

  public async findByType(type: TYPE_OTP, userId: string): Promise<OtpEntity | null> {
    return await this.getManager().findOne(OtpEntity, {
      where: { typeOtp: type, user: { id: userId } },
      order: { createdAt: 'DESC' }
    });
  }

}

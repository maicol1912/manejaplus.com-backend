import { Injectable, OnModuleInit, Logger as NestLogger } from '@nestjs/common';
import { ElasticSearchService } from './elasticsearch.service';
import { Logger } from 'winston';

@Injectable()
export class AppLogger implements OnModuleInit {
  private static instance: AppLogger;
  private logger: Logger | NestLogger;

  constructor(private elasticSearchService: ElasticSearchService) {
    if (!AppLogger.instance) {
      AppLogger.instance = this;
    }
    return AppLogger.instance;
  }

  async onModuleInit() {
    this.logger = await this.elasticSearchService.winstonLogger('app-logs', 'info');
    this.startReconnectionAttempts();
  }

  private async startReconnectionAttempts() {
    while (this.logger instanceof NestLogger) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      this.logger = await this.elasticSearchService.winstonLogger('app-logs', 'info');
    }
  }

  private static getInstance(): AppLogger {
    return AppLogger.instance;
  }

  public static log(message: string, meta?: any) {
    const instance = this.getInstance();
    if (instance.logger instanceof Logger) {
      instance.logger.info(message, meta);
    } else {
      (instance.logger as NestLogger).log(message, meta);
    }
  }

  public static error(message: string, meta?: any) {
    const instance = this.getInstance();
    if (instance.logger instanceof Logger) {
      instance.logger.error(message, meta);
    } else {
      (instance.logger as NestLogger).error(message, meta);
    }
  }

  public static debug(message: string, meta?: any) {
    const instance = this.getInstance();
    if (instance.logger instanceof Logger) {
      instance.logger.debug(message, meta);
    } else {
      (instance.logger as NestLogger).debug(message, meta);
    }
  }

  public static warn(message: string, meta?: any) {
    const instance = this.getInstance();
    if (instance.logger instanceof Logger) {
      instance.logger.warn(message, meta);
    } else {
      (instance.logger as NestLogger).warn(message, meta);
    }
  }
}

import { DynamicModule, Module } from '@nestjs/common';
import { ElasticSearchService } from './elasticsearch.service';
import { AppLogger } from './app.logger';

@Module({})
export class ElasticSearchModule {
  static forRoot(): DynamicModule {
    return {
      module: ElasticSearchModule,
      providers: [
        {
          provide: ElasticSearchService,
          useFactory: async () => {
            const service = new ElasticSearchService();
            return service;
          }
        },
        AppLogger
      ],
      exports: [ElasticSearchService, AppLogger]
    };
  }
}

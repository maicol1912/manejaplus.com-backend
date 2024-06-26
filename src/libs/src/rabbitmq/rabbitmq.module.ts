import * as config from "config"
import { DynamicModule, Module } from '@nestjs/common';
import { RQMService } from './rabbitmq.service';

@Module({})
export class RmqModule {
    static register(): DynamicModule {
        return {
            module: RmqModule,
            providers: [RQMService],
            exports: [RQMService],
        };
    }
}
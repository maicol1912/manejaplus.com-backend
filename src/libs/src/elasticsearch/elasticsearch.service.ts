import { Injectable, OnModuleInit, Logger as NestLogger } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import config from 'config';
import winston, { Logger } from 'winston';
import {
  ElasticsearchTransformer,
  ElasticsearchTransport,
  LogData,
  TransformedData,
} from 'winston-elasticsearch';

@Injectable()
export class ElasticSearchService {
  private ELASTIC_URL: string = config.get<string>('ELASTIC_SEARCH_URL');
  private logger: Logger | NestLogger = new NestLogger(ElasticSearchService.name);
  private isConnected: boolean = false;
  private static client: Client;

  constructor() {
    if (!ElasticSearchService.client) {
      ElasticSearchService.client = new Client({
        node: this.ELASTIC_URL,
      });
      this.checkConnection();
    }
  }

  private async checkConnection(): Promise<void> {
    while (!this.isConnected) {
      try {
        const health = await ElasticSearchService.client.cluster.health({});
        this.isConnected = true;
      } catch (error) {
        this.logger.error('Connection to Elasticsearch failed. Retrying...', error);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  public async winstonLogger(name: string, level: string): Promise<Logger> {
    if (this.isConnected) {
      const esTransformer = (logData: LogData): TransformedData => {
        return ElasticsearchTransformer(logData);
      };

      const options = {
        console: {
          level,
          handleExceptions: true,
          json: false,
          colorize: true,
        },
        elasticsearch: {
          level,
          transformer: esTransformer,
          clientOpts: {
            node: this.ELASTIC_URL,
            log: level,
            maxRetries: 2,
            requestTimeout: 10000,
            sniffOnStart: false,
          },
        },
      };
      const esTransport: ElasticsearchTransport = new ElasticsearchTransport(options.elasticsearch);
      const logger: Logger = winston.createLogger({
        exitOnError: false,
        defaultMeta: { service: name },
        transports: [new winston.transports.Console(options.console), esTransport],
      });
      return logger;
    } else {
      this.logger.warn('Not connected to Elasticsearch. Using NestJS logger.');
      return new NestLogger(name) as unknown as Logger;
    }
  }
}

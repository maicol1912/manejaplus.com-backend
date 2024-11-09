import { Injectable } from '@nestjs/common';
import { Channel, Connection } from 'amqplib';
import * as amqplib from 'amqplib';

@Injectable()
export class RQMService {
    private channel: amqplib.Channel;

    async connectToRabbitMQ(connectionUrl: string) {
        try {
            const connection = await amqplib.connect(connectionUrl);
            this.channel = await connection.createChannel();
            this.closeConnection(this.channel, connection);
            return this.channel;
        } catch (error) {
            console.error('Error creating rqm connection:', error);
            return undefined;
        }


    }
    async closeConnection(channel: Channel, connection: Connection): Promise<void> {
        process.once('SIGINT', async () => {
            await channel.close();
            await connection.close();
        });
    }

    async registerConsumer(exchangeName: string, routingKey: string, queueName: string, callback: (message: any) => void) {
        await this.channel.assertExchange(exchangeName, 'direct');
        const queue = await this.channel.assertQueue(queueName, { durable: true });
        await this.channel.bindQueue(queue.queue, exchangeName, routingKey);
        this.channel.consume(queue.queue, (message) => {
            callback(message.content.toString());
            this.channel.ack(message);
        });
    }

    async registerProducer(exchangeName: string, routingKey: string, message: string) {
        await this.channel.assertExchange(exchangeName, 'direct');
        this.channel.publish(exchangeName, routingKey, Buffer.from(message));
    }
}
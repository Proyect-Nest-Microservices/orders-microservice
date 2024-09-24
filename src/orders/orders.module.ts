import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PRODUCT_SERVICE } from 'src/config';
import { NatsModule } from 'src/transports/nats.module';


@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [NatsModule]
 
})
export class OrdersModule {}

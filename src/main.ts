import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('OrdersMS-Main');

  logger.error(envs.NATS_SERVERS)

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {  
        servers:envs.NATS_SERVERS
      }
    }
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted:true
    })
  )

  await app.listen(); 
  logger.log(`Orders Microservice running on ${envs.PORT}`);
}
bootstrap();

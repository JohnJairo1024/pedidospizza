import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { PedidoController } from './pedido.controller';
import { PedidoService } from './pedido.service';
import { PedidoConsumer } from './pedido.consumer';
import { BonitaService } from '../bonita/bonita.service';

const isRabbitMQEnabled = process.env.RABBITMQ_ENABLED !== 'false';

@Module({
  imports: [
    ...(isRabbitMQEnabled
      ? [
          RabbitMQModule.forRoot({
            exchanges: [
              {
                name: 'pedidos.exchange',
                type: 'topic',
              },
              {
                name: 'entregas.exchange',
                type: 'topic',
              },
            ],
            uri:
              process.env.RABBITMQ_URL ||
              'amqp://admin:admin123@localhost:5672',
            connectionInitOptions: {
              wait: false,
              reject: false,
            },
            connectionManagerOptions: {
              heartbeatIntervalInSeconds: 15,
              reconnectTimeInSeconds: 30,
            },
            enableControllerDiscovery: true,
          }),
        ]
      : []),
  ],
  controllers: [PedidoController],
  providers: [
    PedidoService,
    ...(isRabbitMQEnabled ? [PedidoConsumer] : []),
    BonitaService,
  ],
  exports: [PedidoService],
})
export class PedidoModule {}

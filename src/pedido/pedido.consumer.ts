import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { BonitaService } from '../bonita/bonita.service';
import { EntregaConfirmadaEvent } from './pedido.dto';

@Injectable()
export class PedidoConsumer {
  private readonly logger = new Logger(PedidoConsumer.name);

  constructor(private readonly bonitaService: BonitaService) {}

  @RabbitSubscribe({
    exchange: 'entregas.exchange',
    routingKey: 'entrega.confirmada',
    queue: 'pedidos.entrega.confirmada',
  })
  async handleEntregaConfirmada(event: EntregaConfirmadaEvent) {
    this.logger.log(
      `Recibido evento entrega.confirmada para pedido: ${event.pedidoId}`,
    );

    try {
      // Enviar mensaje a Bonita BPM para avanzar el proceso
      await this.bonitaService.confirmEntrega(event.pedidoId, {
        pedidoId: event.pedidoId,
        fechaEntrega: event.fechaEntrega,
        entregadoPor: event.entregadoPor,
        observaciones: event.observaciones,
      });

      this.logger.log(
        `Mensaje entregaConfirmada enviado a Bonita BPM para pedido: ${event.pedidoId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error al procesar entrega confirmada para pedido ${event.pedidoId}:`,
        error,
      );
      throw error;
    }
  }
}

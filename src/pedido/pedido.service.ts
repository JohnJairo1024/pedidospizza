import { Injectable, Logger, Optional } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { CrearPedidoDto, PedidoCreadoEvent } from './pedido.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PedidoService {
  private readonly logger = new Logger(PedidoService.name);

  constructor(@Optional() private readonly amqpConnection: AmqpConnection) {}

  async crearPedido(
    crearPedidoDto: CrearPedidoDto,
  ): Promise<{ pedidoId: string }> {
    // Generar ID único para el pedido
    const pedidoId = uuidv4();

    // Calcular total del pedido
    const total = crearPedidoDto.items.reduce(
      (sum, item) => sum + item.cantidad * item.precio,
      0,
    );

    // Crear evento de pedido creado
    const pedidoCreadoEvent: PedidoCreadoEvent = {
      pedidoId,
      clienteId: crearPedidoDto.clienteId,
      direccionEntrega: crearPedidoDto.direccionEntrega,
      items: crearPedidoDto.items,
      total,
      fechaCreacion: new Date(),
      observaciones: crearPedidoDto.observaciones,
    };

    try {
      // Publicar evento a RabbitMQ si está disponible
      if (this.amqpConnection) {
        await this.amqpConnection.publish(
          'pedidos.exchange',
          'pedido.creado',
          pedidoCreadoEvent,
        );
        this.logger.log(
          `Evento pedido.creado publicado para pedido ${pedidoId}`,
        );
      } else {
        this.logger.warn('RabbitMQ no está disponible. Evento no publicado.');
      }

      return { pedidoId };
    } catch (error) {
      this.logger.error(`Error al publicar evento pedido.creado:`, error);
      // Aún devolvemos el pedidoId aunque falle la publicación
      return { pedidoId };
    }
  }
}

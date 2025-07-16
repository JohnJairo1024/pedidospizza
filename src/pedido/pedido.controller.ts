import { Controller, Post, Body, Logger } from '@nestjs/common';
import { CrearPedidoDto } from './pedido.dto';
import { PedidoService } from './pedido.service';

@Controller('pedido')
export class PedidoController {
  private readonly logger = new Logger(PedidoController.name);

  constructor(private readonly pedidoService: PedidoService) {}

  @Post()
  async crearPedido(@Body() crearPedidoDto: CrearPedidoDto) {
    this.logger.log('Recibida solicitud para crear pedido');

    try {
      const resultado = await this.pedidoService.crearPedido(crearPedidoDto);
      this.logger.log(`Pedido creado exitosamente: ${resultado.pedidoId}`);

      return {
        success: true,
        message: 'Pedido creado exitosamente',
        data: resultado,
      };
    } catch (error) {
      this.logger.error('Error al crear pedido:', error);
      throw error;
    }
  }
}

import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ItemPedidoDto {
  @IsString()
  nombre: string;

  @IsNumber()
  cantidad: number;

  @IsNumber()
  precio: number;
}

export class CrearPedidoDto {
  @IsString()
  clienteId: string;

  @IsString()
  direccionEntrega: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoDto)
  items: ItemPedidoDto[];

  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class PedidoCreadoEvent {
  pedidoId: string;
  clienteId: string;
  direccionEntrega: string;
  items: ItemPedidoDto[];
  total: number;
  fechaCreacion: Date;
  observaciones?: string;
}

export class EntregaConfirmadaEvent {
  pedidoId: string;
  fechaEntrega: Date;
  entregadoPor: string;
  observaciones?: string;
}

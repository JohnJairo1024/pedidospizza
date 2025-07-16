# 📦 Microservicio de Pedidos - Bonita BPM Integration

Microservicio desarrollado con **NestJS** que maneja pedidos e integra con **Bonita BPM** y **RabbitMQ**.

## 🚀 Funcionalidades

- 📦 **Endpoint POST /pedido** - Crear nuevos pedidos
- 📤 **Publica evento `pedido.creado`** a RabbitMQ
- 📥 **Escucha evento `entrega.confirmada`** desde RabbitMQ  
- 🔁 **Integración con Bonita BPM** - Envía mensaje `entregaConfirmada` al proceso

## 🛠️ Estructura del Proyecto

```
src/
├── app.module.ts
├── main.ts
├── pedido/
│   ├── pedido.controller.ts   ← POST /pedido
│   ├── pedido.service.ts      ← lógica y emite evento
│   ├── pedido.consumer.ts     ← escucha eventos
│   ├── pedido.dto.ts          ← DTOs y eventos
│   └── pedido.module.ts       ← módulo de pedidos
├── bonita/
│   └── bonita.service.ts      ← llama Bonita REST API
└── rabbitmq/
    └── rabbitmq.module.ts     ← conexión y config de cola
```

## 📋 Prerequisitos

- Node.js 18+
- RabbitMQ ejecutándose en puerto 5672
- Bonita BPM ejecutándose en puerto 8080

## 🔧 Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd bonitanest

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar en desarrollo
npm run start:dev
```

## ⚙️ Configuración

Copia el archivo `.env.example` a `.env` y configura las variables:

```env
# Puerto del servidor
PORT=3000

# Configuración de RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# Configuración de Bonita BPM
BONITA_URL=http://localhost:8080/bonita
BONITA_USERNAME=admin
BONITA_PASSWORD=bpm
```

## 🔄 Flujo de Trabajo

1. **Crear Pedido**: POST a `/pedido` con datos del pedido
2. **Evento Publicado**: Se emite `pedido.creado` a RabbitMQ
3. **Entrega Confirmada**: El servicio escucha `entrega.confirmada`
4. **Bonita Notificación**: Se envía mensaje `entregaConfirmada` a Bonita BPM

## 📡 API Endpoints

### POST /pedido
Crea un nuevo pedido

**Request Body:**
```json
{
  "clienteId": "cliente-123",
  "direccionEntrega": "Calle Principal 123, Ciudad",
  "items": [
    {
      "nombre": "Producto 1",
      "cantidad": 2,
      "precio": 29.99
    },
    {
      "nombre": "Producto 2", 
      "cantidad": 1,
      "precio": 15.50
    }
  ],
  "observaciones": "Entregar en horario de oficina"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pedido creado exitosamente",
  "data": {
    "pedidoId": "uuid-generado"
  }
}
```

## 📨 Eventos de RabbitMQ

### Evento Publicado: `pedido.creado`
```json
{
  "pedidoId": "uuid-generado",
  "clienteId": "cliente-123",
  "direccionEntrega": "Calle Principal 123",
  "items": [...],
  "total": 75.48,
  "fechaCreacion": "2024-01-15T10:30:00Z",
  "observaciones": "Entregar en horario de oficina"
}
```

### Evento Escuchado: `entrega.confirmada`
```json
{
  "pedidoId": "uuid-generado",
  "fechaEntrega": "2024-01-16T14:30:00Z",
  "entregadoPor": "Juan Pérez",
  "observaciones": "Entregado en recepción"
}
```

## 🏃‍♂️ Ejecución

```bash
# Desarrollo con watch mode
npm run start:dev

# Producción
npm run start:prod

# Tests
npm run test
npm run test:e2e
```

## 🐳 Docker (Opcional)

```bash
# Construir imagen
docker build -t microservicio-pedidos .

# Ejecutar con docker-compose
docker-compose up
```

## 🧪 Testing

El microservicio incluye pruebas unitarias y de integración:

```bash
# Pruebas unitarias
npm run test

# Pruebas e2e
npm run test:e2e

# Cobertura
npm run test:cov
```

## 📚 Tecnologías Utilizadas

- **NestJS** - Framework principal
- **RabbitMQ** - Mensajería asíncrona (@golevelup/nestjs-rabbitmq)
- **Axios** - Cliente HTTP para Bonita BPM
- **class-validator** - Validación de DTOs
- **class-transformer** - Transformación de datos
- **uuid** - Generación de IDs únicos

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

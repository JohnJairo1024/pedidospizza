@echo off
echo 🐳 Iniciando RabbitMQ con Docker Compose...
docker-compose up -d

echo ⏳ Esperando que RabbitMQ este listo...
timeout /t 10 /nobreak > nul

echo 🔍 Verificando estado de RabbitMQ...
docker-compose ps

echo ✅ RabbitMQ deberia estar disponible en:
echo    - AMQP: amqp://admin:admin123@localhost:5672
echo    - Management UI: http://localhost:15672 (admin/admin123)

echo 🚀 Ahora puedes iniciar el microservicio con: npm run start:dev
pause

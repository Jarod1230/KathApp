import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  // Takes effect for endpoints whose @Body is a class DTO. Endpoints that
  // still declare a plain TypeScript type validate by hand in their service;
  // converting those payloads to class DTOs is follow-up work.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
  });

  const config = new DocumentBuilder()
    .setTitle('KathApp API')
    .setDescription('Contract-v1 API — GPL-3.0')
    .setVersion('0.0.1')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`KathApp API listening on http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`OpenAPI at http://localhost:${port}/docs`);
}

bootstrap();

import { INestApplication, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

/**
 * Everything main.ts applies to the app beyond the module graph.
 *
 * It lives here so tests can boot an app configured exactly like production.
 * A search paging regression once slipped through because the HTTP test built
 * the module without the global pipes, and the defect was in a pipe.
 */
export function configureApp(app: INestApplication): void {
  app.use(helmet());

  // Takes effect for endpoints whose @Body is a class DTO. Endpoints that
  // still declare a plain TypeScript type validate by hand in their service.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  });
}

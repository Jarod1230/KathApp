#!/usr/bin/env node
/**
 * Writes the OpenAPI document to `docs/openapi.json` at the repository root.
 *
 * The document only existed at runtime under `/docs`, which meant it could not
 * be read, reviewed or diffed without booting the API. A committed file makes a
 * contract change visible in the pull request that causes it.
 *
 * Run with `--check` to fail instead of writing when the committed file no
 * longer matches what the code produces. That is what CI runs.
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const target = resolve(here, '../../../docs/openapi.json');
const checkOnly = process.argv.includes('--check');

// Building the document instantiates the Nest container, which constructs
// AuthModule, which refuses to start without a secret. A throwaway value is
// enough: nothing here signs anything.
process.env.JWT_SECRET ??= 'openapi-emit-not-a-real-secret';
process.env.DATABASE_URL ??= 'postgresql://unused:unused@127.0.0.1:1/unused';

const { NestFactory } = await import('@nestjs/core');
const { DocumentBuilder, SwaggerModule } = await import('@nestjs/swagger');
const { AppModule } = await import('../dist/app.module.js');

const app = await NestFactory.create(AppModule, { logger: false, abortOnError: false });

const config = new DocumentBuilder()
  .setTitle('KathApp API')
  .setDescription('Contract-v1 API — GPL-3.0')
  .setVersion('0.0.1')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
await app.close();

const serialised = `${JSON.stringify(document, null, 2)}\n`;

if (checkOnly) {
  let committed;
  try {
    committed = readFileSync(target, 'utf8');
  } catch {
    console.error('docs/openapi.json fehlt. Erzeugen mit: npm run openapi -w @kathapp/api');
    process.exit(1);
  }
  if (committed !== serialised) {
    console.error(
      'docs/openapi.json weicht vom Code ab.\n' +
        'Erzeugen und mitcommitten: npm run openapi -w @kathapp/api',
    );
    process.exit(1);
  }
  console.log('OpenAPI: die eingecheckte Spezifikation entspricht dem Code.');
} else {
  writeFileSync(target, serialised);
  console.log(`OpenAPI geschrieben: ${target}`);
}

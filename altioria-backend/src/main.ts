import 'dotenv/config';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { setupSwagger } from './swagger/setup-swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();
  app.setGlobalPrefix('api');

  const environment = process.env.NODE_ENV ?? 'development';
  const isProduction = environment === 'production';

  if (!isProduction) {
    setupSwagger(app, environment);
  }

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
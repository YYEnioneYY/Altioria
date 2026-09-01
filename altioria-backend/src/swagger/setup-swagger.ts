import { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

export function setupSwagger(
  app: INestApplication,
  environment: string,
): void {
  const config = new DocumentBuilder()
    .setTitle(`Altioria API — ${environment}`)
    .setDescription('Документация REST API проекта Altioria')
    .setVersion('1.0.0')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, {
      operationIdFactory: (_controllerKey, methodKey) => methodKey,
    });

  SwaggerModule.setup('docs', app, documentFactory, {
    useGlobalPrefix: true,
    customSiteTitle: `Altioria API — ${environment}`,
    swaggerOptions: {
      withCredentials: true,
    },
  });
}
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json, urlencoded, static as serveStatic } from 'express';
import swaggerUiDist from 'swagger-ui-dist';
import { AppModule } from './app.module';

function isTrue(value: string | undefined): boolean {
  return value?.toLowerCase() === 'true';
}

async function bootstrap() {
  // rawBody: true enables NestJS native raw body storage (needed for Stripe webhook)
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Enable CORS
  app.enableCors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  });

  // Allow larger payloads for base64 image strings from admin forms.
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const enableSwagger =
    process.env.NODE_ENV !== 'production' || isTrue(process.env.ENABLE_SWAGGER);

  if (enableSwagger) {
    // Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('Hotel Booking System API')
      .setDescription(
        'Complete REST API for managing hotel room booking, payments via Stripe, and email notifications.',
      )
      .setVersion('1.0')
      .addTag('Services', 'Hotel room / service management')
      .addTag('Bookings', 'Booking management')
      .addTag('Stripe Webhook', 'Stripe payment webhook')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });

    // On some serverless deployments, swagger-ui static assets are not auto-served
    // at the generated /api/docs/docs/* paths, which results in a blank docs page.
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.use('/api/docs/docs', serveStatic(swaggerUiDist.getAbsoluteFSPath()));
  }

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Application running on: http://localhost:${port}`);
  if (enableSwagger) {
    console.log(`Swagger docs at: http://localhost:${port}/api/docs`);
  }
}
void bootstrap();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';   // ← ADD this import
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,        // strips properties not in the DTO
    forbidNonWhitelisted: true, // throws error if extra props sent
    transform: true,        // auto-transforms payloads to DTO instances
  }));
  
  await app.listen(3000);
}
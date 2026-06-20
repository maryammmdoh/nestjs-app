import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SERVER_PORT } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

  const port = SERVER_PORT;
  await app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  }
  );
}
bootstrap();


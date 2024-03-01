import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvValidator } from './EnvValidator';

/* check required env variables exist,
 * or exit the process if any are missing */
EnvValidator.validate();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(5000);
}
bootstrap();

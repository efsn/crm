import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalLogger } from './common/logger/global.logger';
import {
  GlobalExceptionFilter,
  HttpExceptionFilter,
} from './common/exceptions/index';
import GlobalInterceptor from './common/interceptors/global.interceptor';
import GlobalMiddleware from './common/middlewares/global.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await initGlobals(app);

  await app.listen(3000);
}
async function initGlobals(app) {
  const logger = app.get(GlobalLogger);
  app.useLogger(logger);
  app.useGlobalFilters(
    new GlobalExceptionFilter(logger),
    new HttpExceptionFilter(logger),
  );
  GlobalMiddleware(app);
  app.useGlobalInterceptors(new GlobalInterceptor(logger));
}

bootstrap();

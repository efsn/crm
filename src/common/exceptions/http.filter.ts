import {
  ExceptionFilter,
  Catch,
  HttpException,
  ArgumentsHost,
} from '@nestjs/common';
import { GlobalLogger } from '../logger/global.logger';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private Logger: GlobalLogger) {}
  catch(exception: any, host: ArgumentsHost): IResponseResult {
    const status = exception.getStatus();
    const { message } = exception;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const { url, method, body } = request;
    this.Logger.error(`${Loggers.ERROR}:${method}_${url}`, {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: url,
      body,
    });
    return {
      statusCode: status,
      code: 'INTERNAL_SERVER_ERROR',
      message,
    };
  }
}

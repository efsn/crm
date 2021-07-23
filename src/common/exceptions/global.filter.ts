import {
  ExceptionFilter,
  Catch,
  HttpStatus,
  ArgumentsHost,
} from '@nestjs/common';
import { GlobalLogger } from '../logger/global.logger';
import { Loggers } from '../../types/loggers';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private Logger: GlobalLogger) {}
  catch(exception: any, host: ArgumentsHost): void {
    const { message, status, stack } = exception;
    console.log(exception);
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse();
    const { url, method, body } = request;
    this.Logger.error(Loggers.ERROR_GLOBAL_EXCEPTION, ` ${method}:${url}`, {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: url,
      body,
      stack,
    });
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message,
    });
  }
}

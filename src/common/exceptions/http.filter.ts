import {
  ExceptionFilter,
  Catch,
  HttpException,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { GlobalLogger } from '../logger/global.logger';
import { Loggers } from 'src/types/loggers';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private Logger: GlobalLogger) {}
  catch(exception: any, host: ArgumentsHost): void {
    const status = exception.getStatus();
    const { message } = exception;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse();
    const { url, method, body } = request;
    this.Logger.error(Loggers.ERROR_HTTP_EXCEPTION, `${method}_${url}`, {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: url,
      body,
      message,
    });
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message,
    });
  }
}

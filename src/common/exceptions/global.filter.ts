import {
  ExceptionFilter,
  Catch,
  HttpStatus,
  ArgumentsHost,
} from '@nestjs/common';
import { GlobalLogger } from '../logger/global.logger';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private Logger: GlobalLogger) {}
  catch(exception: any, host: ArgumentsHost): IResponseResult {
    const status = exception.getStatus();
    const { message } = exception;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const { url, method, body } = request;
    this.Logger.error(
      {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: url,
        body,
      },
      `${method}:${url}`,
    );
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message,
    };
  }
}

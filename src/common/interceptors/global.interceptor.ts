import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GlobalLogger } from '../logger/global.logger';
import { Loggers } from 'src/types/loggers';

@Injectable()
export default class GlobalInterceptor implements NestInterceptor {
  constructor(private logger: GlobalLogger) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const type = context.getType();
    const className = context.getClass();
    const handle = context.getHandler();
    let ctxSwitch = 'switchToHttp';
    if (type === 'ws') ctxSwitch = 'switchToWs';
    if (type === 'rpc') ctxSwitch = 'switchToRpc';
    const ctx = context[ctxSwitch]();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, body, url, trackUUid } = request;
    this.logger.log(
      `${Loggers.CONTROLLER_METHOD}:${trackUUid}:${method}_${url}:${className.name}_${handle.name}`,
      {
        body,
        path: url,
      },
    );
    return next.handle().pipe(
      map<Partial<IResponseResult>, IResponseResult>(
        ({ data, statusCode, message }) => {
          if (statusCode) {
            response.status(statusCode);
          }
          const body = { data, statusCode: statusCode || 0, message };
          this.logger.log(`${Loggers.END}:${trackUUid}:${method}_${url}`, {
            ...body,
            path: url,
          });
          return body;
        },
      ),
    );
  }
}

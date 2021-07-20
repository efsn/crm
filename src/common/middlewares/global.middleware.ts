import { Injectable, NestMiddleware } from '@nestjs/common';
import uuid from 'node-uuid';
import { GlobalLogger } from '../logger/global.logger';

@Injectable()
export default class GlobalMiddleware implements NestMiddleware {
  constructor(private logger: GlobalLogger) {}
  use(req: Request, res: any, next: () => void): any {
    req.trackUUid = uuid.v4();
    const { method, url, body } = req;
    this.logger.log(`${Loggers.START}:${req.trackUUid}:${method}_${url}`, {
      path: url,
      body,
    });
    next();
  }
}

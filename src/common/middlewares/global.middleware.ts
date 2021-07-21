import { v4 as uuidv4 } from 'uuid';
import { GlobalLogger } from '../logger/global.logger';
import { Loggers } from 'src/types/loggers';

export default function globalMiddleware(app) {
  const logger = app.get(GlobalLogger);
  app.use((req: Request, res: any, next) => {
    req.trackUUid = uuidv4();
    const { method, url, body } = req;
    logger.log(`${Loggers.START}:${req.trackUUid}:${method}:${url}`, {
      path: url,
      body,
    });
    next();
  });
}

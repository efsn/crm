import { Logger, Injectable } from '@nestjs/common';

@Injectable()
export class GlobalLogger extends Logger {
  log(message: string, context?: any) {
    if (typeof context === 'object') context = JSON.stringify(context);
    super.log(context, message);
  }

  error(message: any, path: any, context?: any) {
    if (typeof context === 'object') context = JSON.stringify(context);
    super.error(path, context, message);
  }

  warn(message: string, context?: any) {
    if (typeof context === 'object') context = JSON.stringify(context);
    super.warn(message, context);
  }
}

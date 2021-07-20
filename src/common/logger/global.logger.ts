import { Logger, Injectable } from '@nestjs/common';

@Injectable()
export class GlobalLogger extends Logger {
  log(message: string, context?: any) {
    if (typeof context === 'object') context = JSON.stringify(context);
    super.log(message, context);
  }

  error(message: any, context?: any) {
    if (typeof context === 'object') context = JSON.stringify(context);
    super.error(message, context);
  }

  warn(message: string, context?: any) {
    if (typeof context === 'object') context = JSON.stringify(context);
    super.warn(message, context);
  }
}

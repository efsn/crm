import {
  Global,
  Module,
  HttpService as HttpServiceDelegate,
  HttpModule as HttpModuleDelegate,
} from '@nestjs/common';
import ConfigService from '../configs/config.service';
import { defaultConfig, HTTP_SERVICE } from './http.config';
import HttpService from './http.service';

const httpProvider = {
  provide: HTTP_SERVICE,
  useFactory: (http: HttpServiceDelegate) => {
    return new HttpService(http);
  },
  inject: [HttpServiceDelegate],
};

@Global()
@Module({
  imports: [
    HttpModuleDelegate.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ...defaultConfig,
      }),
    }),
  ],
  providers: [httpProvider],
  exports: [httpProvider],
})
export default class HttpModule {}

import { Global, Module } from '@nestjs/common';
import EnvConfigModule from './configs/envConfig.moudule';
import { GlobalLogger } from './logger/global.logger';
import ConfigService from './configs/config.service';
import HttpModule from './http/http.module';

@Global()
@Module({
  imports: [EnvConfigModule, HttpModule],
  providers: [ConfigService, GlobalLogger],
  exports: [GlobalLogger, ConfigService],
})
export default class CommonModule {}

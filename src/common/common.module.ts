import { Global, Module } from '@nestjs/common';
import EnvConfigModule from './configs/envConfig.moudule';
import { GlobalLogger } from './logger/global.logger';
import ConfigService from './configs/config.service';

@Global()
@Module({
  imports: [EnvConfigModule],
  providers: [ConfigService, GlobalLogger],
  exports: [EnvConfigModule, GlobalLogger],
})
export default class CommonModule {}

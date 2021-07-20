import { Module } from '@nestjs/common';
import CommonModule from './common/common.module';
import DemosModule from './demos/demos.module';
import OrmModule from './typeorm/orm.module';
import ConfigService from './common/configs/config.service';

@Module({
  imports: [CommonModule, DemosModule, OrmModule.forRoot(new ConfigService)],
  controllers: [],
  providers: [],
})
export class AppModule {}

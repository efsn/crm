import { Module } from '@nestjs/common';
import CommonModule from './common/common.module';
import DemosModule from './demos/demos.module';
import OrmModule from './typeorm/orm.module';

@Module({
  imports: [CommonModule, DemosModule, OrmModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

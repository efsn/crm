import { Module } from '@nestjs/common';
import CommonModule from './common/common.module';
import OrmModule from './typeorm/orm.module';
import ControllersModule from './controllers/controllers.module';

@Module({
  imports: [CommonModule, OrmModule, ControllersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

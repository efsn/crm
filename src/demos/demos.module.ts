import { Module } from '@nestjs/common';
import DemoOneController from './one/demoOne.controller';

@Module({
  controllers: [DemoOneController],
})
export default class DemosModule {}

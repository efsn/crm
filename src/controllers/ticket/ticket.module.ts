import { Module } from '@nestjs/common';
import FundController from './fund/fund.controller';
import FundService from './fund/fund.service';
@Module({
  controllers: [FundController],
  providers: [FundService],
})
export default class TicketModule {}

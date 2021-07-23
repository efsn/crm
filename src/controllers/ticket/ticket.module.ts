import { Module } from '@nestjs/common';
import FundController from './fund/fund.controller';
import FundService from './fund/fund.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from '../../typeorm/entity/user.entity';
import TicketGroup from '../../typeorm/entity/ticketGroup.entity';
import Ticket from '../../typeorm/entity/ticket.entity';
import TicketFund from '../../typeorm/entity/ticketFund.entity';
@Module({
  imports: [TypeOrmModule.forFeature([User, TicketGroup, Ticket, TicketFund])],
  controllers: [FundController],
  providers: [FundService],
})
export default class TicketModule {}

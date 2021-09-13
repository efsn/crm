import { Module } from '@nestjs/common';
import FundController from './fund/fund.controller';
import FundService from './fund/fund.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from '../../typeorm/entity/user.entity';
import TicketGroup from '../../typeorm/entity/ticketGroup.entity';
import Ticket from '../../typeorm/entity/ticket.entity';
import TicketFund from '../../typeorm/entity/ticketFund.entity';
import TicketFundTotal from '../../typeorm/entity/ticketFundTotal.entity';
import TicketGroupFund from '../../typeorm/entity/ticketGroupFund.entity';
import AnalysisController from './analysis/analysis.controller';
import AnalysisService from './analysis/analysis.service';
import TicketDayVolumeEntity from '../../typeorm/entity/ticketDayVolume.entity';
import TicketDayMlf from '../../typeorm/entity/ticketDayMlf.entity';
import TicketConcept from '../../typeorm/entity/ticket.concept';
import TicketShare from '../../typeorm/entity/ticket.share';
import TicketShareFinance from '../../typeorm/entity/ticket.shareFinance';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      TicketGroup,
      Ticket,
      TicketFund,
      TicketFundTotal,
      TicketGroupFund,
      TicketDayVolumeEntity,
      TicketDayMlf,
      TicketConcept,
      TicketShare,
      TicketShareFinance,
    ]),
  ],
  controllers: [FundController, AnalysisController],
  providers: [FundService, AnalysisService],
  exports: [FundService, AnalysisService],
})
export default class TicketModule {}

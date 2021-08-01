import { Injectable } from '@nestjs/common';
import { GlobalLogger } from '../logger/global.logger';
import { Cron } from '@nestjs/schedule';
import FundService from '../../controllers/ticket/fund/fund.service';

@Injectable()
export default class TaskService {
  constructor(
    private Logger: GlobalLogger,
    private readonly fundService: FundService,
  ) {}
  // * * * * * *
  // | | | | | |
  // | | | | | day of week
  // | | | | month
  // | | | day of month
  // | | hour
  // | minute

  @Cron('0 10 18 * * 1-5')
  handleCron() {
    const { fundService } = this;
    fundService.refresh().then((res) => {
      this.Logger.debug(res.message);
    });
  }
}

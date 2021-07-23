import { Controller, Get } from '@nestjs/common';
import FundService from './fund.service';

@Controller('ticket/fund')
export default class FundController {
  constructor(private readonly fundService: FundService) {}

  @Get('sort')
  async sort() {
    const { fundService } = this;
    return await fundService.refresh();
  }
}

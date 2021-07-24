import { Controller, Get, Query, Post, Body, HttpStatus } from '@nestjs/common';
import FundService from './fund.service';

@Controller('ticket/fund')
export default class FundController {
  constructor(private readonly fundService: FundService) {}

  @Get('refresh')
  async refresh(): Promise<IResponseResult> {
    const { fundService } = this;
    return await fundService.refresh();
  }

  @Get('sql')
  async sql(@Query('name') name) {
    const { fundService } = this;
    return await fundService.saveGroupTotal('2021-07-23');
  }

  /*
   * 股票的基金持仓当日排名
   * */
  @Get('list')
  async list(
    @Query('page') page = 0,
    @Query('date') date: string,
    @Query('pageSize') pageSize = 30,
  ): Promise<IResponseResult> {
    const { fundService } = this;
    const data = await fundService.list(
      {
        page,
        pageSize,
      },
      date,
    );
    return {
      data,
    };
  }

  /*
   * 添加板块
   * */
  @Post('group')
  async postGroup(@Body('name') name: string): Promise<IResponseResult> {
    if (!name)
      return {
        statusCode: HttpStatus.NOT_ACCEPTABLE,
        message: 'parameter error',
      };
    const { fundService } = this;
    const data = await fundService.saveTicketGroup({
      name,
    });
    return {
      data,
    };
  }

  /*
   * 板块列表
   * */
  @Get('group')
  async getGroup(
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 30,
  ): Promise<IResponseResult> {
    const { fundService } = this;
    const data = await fundService.getTicketGroup({
      page,
      pageSize,
    });
    return {
      data,
    };
  }

  /*
   * 板块的基金持仓当日排名
   * */
  @Get('group/total')
  async getGroupTotal(@Query('date') date: string): Promise<IResponseResult> {
    const data = await this.fundService.getGroupTotal(date);
    return {
      data,
    };
  }
}

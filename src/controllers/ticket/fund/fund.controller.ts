import { Controller, Get, Query, Post, Body, HttpStatus } from '@nestjs/common';
import FundService from './fund.service';
import TicketGroup from '../../../typeorm/entity/ticketGroup.entity';

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
    return await fundService.sql();
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
  async postGroup(
    @Body('name') name: string,
    @Body('id') id: number,
  ): Promise<IResponseResult> {
    if (!name)
      return {
        statusCode: HttpStatus.NOT_ACCEPTABLE,
        message: 'parameter error',
      };
    const { fundService } = this;
    const param: Partial<TicketGroup> = {
      name,
    };
    if (id) param.id = id;
    const data = await fundService.saveTicketGroup(param);
    return {
      data,
    };
  }

  /*
   * 板块列表
   * */
  @Get('group')
  async getGroup(): Promise<IResponseResult> {
    const { fundService } = this;
    const data = await fundService.getTicketGroup();
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

  /*
   * 获取前150的基金总共持仓
   * */
  @Get('total')
  async getTotal() {
    const { fundService } = this;
    return fundService.getTotal();
  }

  /*
   * 获取前200的基金板块持仓
   * */
  @Get('type/total')
  async getTypeTotal() {
    const { fundService } = this;
    return fundService.getTodayGroupPercent();
  }

  /*
   * 添加股票到板块中
   * */
  @Post('save')
  async postSave(
    @Body('groupId') groupId: number,
    @Body('ticketId') ticketId: number,
    @Body('type') type: number,
  ): Promise<IResponseResult> {
    const { fundService } = this;
    const data = await fundService.ticketToGroup(
      { id: ticketId },
      {
        id: groupId,
      },
      type ? 'ADD' : 'DELETE',
    );
    return {
      data,
    };
  }
}

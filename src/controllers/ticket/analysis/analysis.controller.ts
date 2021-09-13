import { Controller, Get, Query, Post, Body, HttpStatus } from '@nestjs/common';
import AnalysisService from './analysis.service';
import { query } from 'express';

@Controller('ticket/analysis')
export default class AnalysisController {
  constructor(private readonly analysis: AnalysisService) {}
  /*
   * 成交量和换手率
   * */
  @Get('volume')
  async getVolume() {
    const { analysis } = this;
    return analysis.getTodayVolume();
  }
  /*
   * 逆回购信息
   * */
  @Get('mlf')
  async getMlf(@Query('refresh') refresh: string) {
    const { analysis } = this;
    return analysis.getDayMlfIndex(!!parseInt(refresh));
  }
  @Get('mlf/other')
  async getMlfOther(@Query('refresh') refresh: string) {
    const { analysis } = this;
    return analysis.getDayOtherMflIndex(!!parseInt(refresh));
  }
  @Get('channels')
  async getChannels() {
    const { analysis } = this;
    return analysis.getChannels();
  }
  @Get('channels/detail')
  async getChannelsDetail(@Query('code') code: string) {
    const { analysis } = this;
    return analysis.getChannelShares(code);
  }
  @Get('concept')
  async getConcept(
    @Query('page') page = 0,
    @Query('isShow') isShow = '0',
    @Query('pageSize') pageSize = 30,
  ) {
    const { analysis } = this;
    return analysis.getConcepts({ isShow: parseInt(isShow), page, pageSize });
  }

  @Post('concept/option')
  async PostConceptOption(
    @Body('code') code: string,
    @Body('isShow') isShow = '0',
  ) {
    const { analysis } = this;
    return analysis.optionConcept(code, parseInt(isShow));
  }

  @Get('concept/refresh')
  async getConceptRefresh() {
    const { analysis } = this;
    return analysis.refreshConcepts();
  }

  @Get('concept/detail/refresh')
  async getConceptDetailRefresh(@Query('code') code: string) {
    const { analysis } = this;
    return analysis.getChannelShares(code);
  }

  @Get('sql')
  async getSql() {
    const { analysis } = this;
    return analysis.getConcepts({});
  }
}

import { Injectable, Inject } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cheerio = require('cheerio');
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HTTP_SERVICE } from '../../../common/http/http.config';
import HttpService from '../../../common/http/http.service';
import { dateFormat } from '../../../utils/common';
import Ticket from '../../../typeorm/entity/ticket.entity';
import TicketFund from '../../../typeorm/entity/ticketFund.entity';
import TicketGroup from '../../../typeorm/entity/ticketGroup.entity';
import TicketFundTotal from '../../../typeorm/entity/ticketFundTotal.entity';
import TicketGroupFund from '../../../typeorm/entity/ticketGroupFund.entity';

@Injectable()
export default class FundService {
  private LENGTH = 200;
  private REFRESHING = false;
  @InjectRepository(Ticket)
  private ticket: Repository<Ticket>;
  @InjectRepository(TicketGroup)
  private ticketGroup: Repository<TicketGroup>;
  @InjectRepository(TicketFundTotal)
  private ticketFundTotal: Repository<TicketFundTotal>;
  @InjectRepository(TicketFund)
  private ticketFund: Repository<TicketFund>;
  @InjectRepository(TicketGroupFund)
  private ticketGroupFund: Repository<TicketGroupFund>;
  constructor(@Inject('HTTP_SERVICE') private httpService: HttpService) {}

  /*
   * 拉取当日的数据
   * */
  async refresh(): Promise<Partial<IResponseResult>> {
    if (this.REFRESHING)
      return {
        data: {},
        message: `refreshing`,
      };
    this.REFRESHING = true;
    const todayTime = dateFormat(new Date(), 'yyyy-MM-dd');
    const [, total] = await this.queryTicketFund(todayTime);
    if (total > 0)
      return {
        data: {},
        message: `${todayTime} has refreshed`,
      };
    const result = await this.getList(this.getFundUrl(todayTime, this.LENGTH));
    let data = {
      totalList: [],
      scaleList: [],
    };
    if (result) {
      data = await this.storeMap(result);
      await this.saveToStore(data.totalList, todayTime);
    }
    this.REFRESHING = false;
    return {
      data,
    };
  }

  /*
   * 获取列表
   * */
  async list(
    pagination: IPaginationDto,
    date = dateFormat(new Date(), 'yyyy-MM-dd'),
  ) {
    const [fundList, total] = await this.queryTicketFund(date, pagination);
    const list = await this.ticket.findByIds(
      fundList.map((item) => item.ticket),
      { relations: ['fund', 'ticketGroups'] },
    );
    return {
      list,
      total,
      pageTotal: Math.ceil(total / pagination.pageSize),
      ...pagination,
    };
  }

  /*
   * 添加 ticket 到 类型
   * */
  async ticketToGroup(
    ticket: Partial<Ticket>,
    ticketGroup: Partial<TicketGroup>,
    type: 'ADD' | 'DELETE',
  ) {
    const target = await this.ticket.findOne(ticket, {
      relations: ['ticketGroups'],
    });
    if (type === 'ADD')
      target.ticketGroups = [...target.ticketGroups, ticketGroup];
    else
      target.ticketGroups = target.ticketGroups.filter(
        (item) => item.id !== Number(ticketGroup.id),
      );
    return this.ticket.save(target, { reload: true });
  }

  async sql(ticketGroup: Partial<TicketGroup>) {
    const group = await this.saveTicketGroup(ticketGroup);
    const data = await this.ticketToGroup(
      {
        id: 42,
      },
      group,
      'ADD',
    );
    return {
      data,
    };
  }

  /*
   * 添加类型
   * */
  async saveTicketGroup(ticketGroup: Partial<TicketGroup>) {
    const group = await this.ticketGroup.findOne({ name: ticketGroup.name });
    if (group) return group;
    return await this.ticketGroup.save(ticketGroup, {
      reload: true,
    });
  }

  /*
   * 获取类型列表
   * */
  async getTicketGroup(pagination: IPaginationDto) {
    const { pageSize, page } = pagination;
    const [list, total] = await this.ticketGroup
      .createQueryBuilder()
      .offset(pageSize * page)
      .limit(pageSize)
      .getManyAndCount();
    return {
      list,
      total,
      pageTotal: Math.ceil(total / pageSize),
      ...pagination,
    };
  }

  /*
   * 获取板块前10的资金
   * */
  async saveGroupTotal(date = dateFormat(new Date(), 'yyyy-MM-dd')) {
    const groups = await this.ticketGroup.find({
      relations: ['tickets'],
    });
    const list: Array<{
      fund: number;
      total: number;
      group: TicketGroup;
      date: string;
    }> = [];
    for (const item of groups) {
      const { tickets, id } = item;
      const ids = tickets.map((item) => item.id);
      const [funds, total] = await this.ticketFund
        .createQueryBuilder()
        .whereInIds(ids)
        .offset(0)
        .limit(10)
        .getManyAndCount();
      list.push({
        group: item,
        date,
        total,
        fund: funds.reduce((a, item) => a + item.fund, 0),
      });
    }
    list.sort((a, b) => b.fund - a.fund);
    for (const item of list) {
      const sort = list.indexOf(item);
      const { fund, date, total, group } = item;
      const ticketGroupFund = await this.ticketGroupFund.findOne({
        group,
        date,
      });
      await this.ticketGroupFund.save<Partial<TicketGroupFund>>(
        {
          ...ticketGroupFund,
          fund,
          date,
          total,
          sort,
          group,
        },
        { reload: true },
      );
    }
    return list;
  }

  async getGroupTotal(date = dateFormat(new Date(), 'yyyy-MM-dd')) {
    const ticketGroupFunds = await this.ticketGroupFund
      .createQueryBuilder()
      .loadAllRelationIds()
      .where({ date })
      .orderBy('sort', 'ASC')
      .getMany();
    const list = this.ticketGroup.findByIds(
      ticketGroupFunds.map((item) => item.group),
      {
        relations: ['fund'],
      },
    );
    return list;
  }

  async queryTicketFund(
    date: string,
    pagination: IPaginationDto = {
      pageSize: 1,
      page: 0,
    },
  ): Promise<[TicketFund[], number]> {
    const { pageSize, page } = pagination;
    return await this.ticketFund
      .createQueryBuilder()
      .loadAllRelationIds()
      .where({
        date,
      })
      .orderBy('sort', 'ASC')
      .offset(page * pageSize)
      .limit(pageSize)
      .getManyAndCount();
  }

  async saveToStore(list: any[], date: string) {
    const total = list
      .slice(0, 150)
      .reduce((a, item) => a + parseInt(item.value), 0);
    await this.ticketFundTotal.save<Partial<TicketFundTotal>>({
      fund: total,
      date,
    });
    for (const item of list) {
      const index = list.indexOf(item);
      const { name, value } = item;
      const ticket = await this.saveTicket({
        name,
        sort: index,
      });
      await this.saveTicketFund({
        date,
        fund: value,
        ticket: ticket,
        sort: index,
      });
    }
    await this.saveGroupTotal(date);
  }

  async saveTicketFund(fund: Partial<TicketFund>, checkTicketFund?: boolean) {
    if (!checkTicketFund) {
      const check = await this.checkTicketFund(fund);
      fund = {
        ...check,
        ...fund,
      };
    }
    this.ticketFund.save(fund, {
      reload: true,
    });
  }

  async checkTicketFund(
    fund: Partial<TicketFund>,
  ): Promise<TicketFund | undefined> {
    return this.ticketFund.findOne({
      date: fund.date,
      ticket: fund.ticket,
    });
  }

  /*
   * 添加股票
   * */
  async saveTicket(
    ticket: Partial<Ticket>,
    checkHasTicket?: boolean,
  ): Promise<Ticket> {
    if (!checkHasTicket) {
      const check = await this.checkHasTicket(ticket);
      if (check) return check;
    }
    const { name, code, sort } = ticket;
    const newTicket = new Ticket();
    newTicket.name = name;
    newTicket.code = code;
    newTicket.sort = sort;
    return this.ticket.save(newTicket);
  }

  async checkHasTicket(ticket: Partial<Ticket>): Promise<Ticket | undefined> {
    return this.ticket.findOne({ name: ticket.name });
  }

  async storeMap(data) {
    data = await this.getMap(data);
    const totals = {},
      scales = {};
    data.forEach((item) => {
      const { total, list } = item;
      if (list && list.length > 0) {
        list.forEach((current) => {
          const { target, scale } = current;
          if (!scales[target]) {
            scales[target] = parseFloat(scale + '');
          } else {
            scales[target] += parseFloat(scale + '');
          }
          if (!totals[target]) {
            totals[target] = parseFloat(scale + '') * parseFloat(total);
          } else {
            totals[target] += parseFloat(scale + '') * parseFloat(total);
          }
        });
      }
    });
    const totalList = [];
    for (const item in totals) {
      if (totals[item].toFixed(2) > 10)
        totalList.push({
          name: item,
          value: totals[item].toFixed(2),
        });
    }
    const scaleList = [];
    for (const item in scales) {
      scaleList.push({
        name: item,
        value: scales[item].toFixed(2),
      });
    }

    function sort(a) {
      let b = null;
      for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < a.length; j++) {
          if (a[j + 1] && parseFloat(a[j].value) < parseFloat(a[j + 1].value)) {
            b = a[j];
            a[j] = a[j + 1];
            a[j + 1] = b;
          }
        }
      }
    }

    sort(totalList);
    sort(scaleList);
    return {
      totalList,
      scaleList,
    };
  }

  async getList(url) {
    let data = await this.httpService.get<any>(url, {
      headers: {
        Cookie:
          'em_hq_fls=js; intellpositionL=927px; cowminicookie=true; emshistory=%5B%22(300562)(%E4%B9%90%E5%BF%83%E5%8C%BB%E7%96%97)%22%2C%22002812%22%2C%22000338%22%2C%22%E5%9B%BD%E9%99%85%E5%8C%BB%E5%AD%A6%22%2C%22(600089)(%E7%89%B9%E5%8F%98%E7%94%B5%E5%B7%A5)%22%2C%22%E4%B8%AD%E5%85%AC%E6%95%99%E8%82%B2%22%2C%22600371%22%5D; HAList=a-sz-300059-%u4E1C%u65B9%u8D22%u5BCC%2Ca-sh-600745-%u95FB%u6CF0%u79D1%u6280%2Ca-sz-002812-%u6069%u6377%u80A1%u4EFD%2Ca-sh-600585-%u6D77%u87BA%u6C34%u6CE5%2Ca-sz-002607-%u4E2D%u516C%u6559%u80B2%2Ca-sz-000516-%u56FD%u9645%u533B%u5B66%2Ca-sz-000338-%u6F4D%u67F4%u52A8%u529B%2Ca-sh-600089-%u7279%u53D8%u7535%u5DE5%2Ca-sh-601012-%u9686%u57FA%u80A1%u4EFD%2Ca-sz-000998-%u9686%u5E73%u9AD8%u79D1%2Ca-sh-600371-%u4E07%u5411%u5FB7%u519C; intellpositionT=2955px; qgqp_b_id=32105e1e6977ea818f64289341d1b597; waptgshowtime=202124; st_si=19704302060477; st_asi=delete; _adsame_fullscreen_16928=1; ASP.NET_SessionId=hhqva5yjkxc5idzcwfuv2oh1; st_pvi=50417320194642; st_sp=2020-06-01%2011%3A43%3A52; st_inirUrl=http%3A%2F%2Ffinance.eastmoney.com%2Fa%2F202005311503985557.html; st_sn=8; st_psi=20210204111911608-0-1611325173',
        Referer: 'http://fund.eastmoney.com/data/fundranking.html',
        Host: 'fund.eastmoney.com',
        Accept: '*/*',
      },
    });
    if (data) {
      data = data.replace('var rankData =', 'return ');
      data = new Function(data)();
      return data.datas;
    }
    return null;
  }

  async getMap(data) {
    let index = 0;
    const list = [];
    while (data[index]) {
      let item = data[index];
      item = item.split(',');
      const code = item[0];
      const name = item[1];
      const extra = await this.getInfo(code);
      list.push({
        ...extra,
        code,
        name,
      });
      index++;
    }
    return list;
  }

  async getInfo(code) {
    return this.httpService
      .get(`http://fund.eastmoney.com/${code}.html`)
      .then((rst) => {
        const $ = cheerio.load(rst);
        let total =
          $('.infoOfFund tbody tr:first-child td:nth-child(2)')
            .text()
            .split('：')[1] || '';
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        total = new RegExp('^((d|.)+?)((亿元)|元).+').exec(total);
        if (total) total = total[1];
        const list = [];
        $('#position_shares .ui-table-hover tbody tr').each((index, item) => {
          let target = $(item).find('td:first-child a');
          let scale = $(item).find('td:nth-child(2)');
          if (target) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            target = target.text();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            scale = scale.text();
          }
          if (target) {
            list.push({
              target,
              scale,
            });
          }
        });
        return {
          total,
          list,
        };
      });
  }

  getFundUrl(date: string, length: number): string {
    return `http://fund.eastmoney.com/data/rankhandler.aspx?op=ph&dt=kf&ft=gp&rs=&gs=0&sc=3yzf&st=desc&sd=${date}&ed=${date}&qdii=&tabSubtype=,,,,,&pi=1&pn=${length}&dx=1&v=${Math.random()}`;
  }
}

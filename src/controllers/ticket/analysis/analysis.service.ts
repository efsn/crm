import { Injectable, Inject } from '@nestjs/common';
import { launch, Page, Browser } from 'puppeteer';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HTTP_SERVICE } from '../../../common/http/http.config';
import HttpService from '../../../common/http/http.service';
import { dateFormat } from '../../../utils/common';
import {
  analysisFinanceReport,
  getMlf,
  getMlfList,
  getOtherMlf,
  getRecentDays,
} from './utils';
import TicketDayVolumeEntity from '../../../typeorm/entity/ticketDayVolume.entity';
import TicketDayMlf from '../../../typeorm/entity/ticketDayMlf.entity';
import TicketConcept from '../../../typeorm/entity/ticket.concept';
import TicketShare from '../../../typeorm/entity/ticket.share';
import TicketShareFinance from '../../../typeorm/entity/ticket.shareFinance';

@Injectable()
export default class AnalysisService {
  private page: Page;
  private page2: Page;
  private browser: Browser;
  private date: string;
  private toadyDayOtherMflIndexDate: string;
  private cacheToadyDayOtherMflIndexDate: any;
  private cacheMlf: any;
  @InjectRepository(TicketDayVolumeEntity)
  private ticketVolume: Repository<TicketDayVolumeEntity>;
  @InjectRepository(TicketDayMlf)
  private ticketDayMlf: Repository<TicketDayMlf>;
  @InjectRepository(TicketConcept)
  private ticketConcept: Repository<TicketConcept>;
  @InjectRepository(TicketShare)
  private ticketShare: Repository<TicketShare>;
  @InjectRepository(TicketShareFinance)
  private ticketShareFinance: Repository<TicketShareFinance>;
  constructor(@Inject('HTTP_SERVICE') private httpService: HttpService) {
    launch({
      headless: true,
      ignoreHTTPSErrors: true,
    }).then(async (browser) => {
      this.browser = browser;
    });
  }
  async sql() {
    const data = await this.getRecentMlf();
    return data;
  }

  async getDayMlfIndex(type = false) {
    const today = dateFormat(new Date(), 'yyyy-MM-dd');
    let data = this.cacheMlf;
    let url = null;
    if (today !== this.date || !data || type) {
      if (!this.page) this.page = await this.browser.newPage();
      await this.page.goto(
        `http://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125475/17081/index1.html`,
        { waitUntil: 'networkidle2' },
      );
      const outerHTML = await this.page.$eval(
        '#r_con',
        (node) => node.outerHTML,
      );
      url = `http://www.pbc.gov.cn${getMlfList(outerHTML)[0]}`;
      data = await this.getDayMlf(url);
      this.date = today;
      this.cacheMlf = data;
    }
    const { tips, list, date } = data;
    const value = list.reduce(
      (a, b) => a + Math.abs(parseFloat(b.value + '')),
      0,
    );
    const recent = await this.getRecentMlf();
    return {
      data: {
        recent,
        tips,
        today: {
          date,
          value,
          url,
        },
      },
    };
  }

  async getDayOtherMflIndex(type = false) {
    const today = new Date();
    let data = this.cacheToadyDayOtherMflIndexDate;
    if (
      this.toadyDayOtherMflIndexDate !== dateFormat(today, 'yyyy-MM-dd') ||
      !data ||
      type
    ) {
      if (!this.page2) this.page2 = await this.browser.newPage();
      await this.page2.goto(
        `http://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125481/index.html`,
        { waitUntil: 'networkidle2' },
      );
      const outerHTML = await this.page2.$eval(
        '#r_con',
        (node) => node.outerHTML,
      );
      await this.page2.goto(
        `http://www.pbc.gov.cn${getMlfList(outerHTML)[0]}`,
        {
          waitUntil: 'networkidle2',
        },
      );
      const time = await this.page2.$eval('#shijian', (node) => node.innerHTML);
      const zoomHTML = await this.page2.$eval(
        '#zoom',
        (node) => node.outerHTML,
      );
      data = getOtherMlf(zoomHTML);
      if (data) {
        data.url = `http://www.pbc.gov.cn${getMlfList(outerHTML)[0]}`;
        const isHas = await this.ticketDayMlf.findOne({
          start: data.start,
          type: '1',
        });
        if (!isHas) await this.ticketDayMlf.save(data);
        if (data.start !== dateFormat(today, 'yyyy-MM-dd')) {
          data = {
            state: 0,
          };
        }
      } else if (
        new Date(time).getTime() >
        new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 3,
        ).getTime()
      ) {
        data = {
          state: 2,
          url: `http://www.pbc.gov.cn${getMlfList(outerHTML)[0]}`,
        };
      }
      this.toadyDayOtherMflIndexDate = dateFormat(today, 'yyyy-MM-dd');
      this.cacheToadyDayOtherMflIndexDate = data;
    }
    return {
      data,
    };
  }

  async getRecentMlf() {
    const times = getRecentDays();
    const list = {};
    for (const item of times) {
      const values = await this.ticketDayMlf.find(item);
      const value = values.reduce((a, b) => a + parseFloat(b.value + ''), 0);
      value !== 0 && (list[item.recovery] = value);
    }
    return list;
  }

  /*
   * 获取某日的逆回购数据
   * */
  async getDayMlf(url) {
    await this.page.goto(url, { waitUntil: 'networkidle2' });
    const time = await this.page.$eval('#shijian', (node) => node.innerHTML);
    const outerHTML = await this.page.$eval('#zoom', (node) => node.outerHTML);
    const data = getMlf(outerHTML, time);
    const { date, list } = data;
    const isHas = await this.ticketDayMlf.findOne({
      start: date,
    });
    if (!isHas) {
      await this.ticketDayMlf.save(list);
    }
    return data;
  }

  async getTodayVolume() {
    const currentTime = new Date();
    let pre = 0;
    if (currentTime.getHours() < 17 && currentTime.getDay() === 1) pre = 3;
    else if (currentTime.getDay() === 0) pre = 2;
    else if (currentTime.getDay() === 6 || currentTime.getHours() < 17) pre = 1;
    const dateCurrent = new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate() - pre,
    );
    const date = dateFormat(dateCurrent, 'yyyyMMdd');
    const data = await this.ticketVolume.findOne({
      date: dateFormat(dateCurrent, 'yyyy-MM-dd'),
    });
    if (!data) {
      const result = await this.getCurrentVolumeDate(date);
      await this.ticketVolume.save(result);
      return {
        data: result,
      };
    }
    return {
      data,
    };
  }
  /*
   * 成交量
   * */

  async getCurrentVolumeDate(startDate = dateFormat(new Date(), 'yyyyMMdd')) {
    const data = await this.httpService.get(
      `http://push2his.eastmoney.com/api/qt/stock/kline/get?fields1=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61&beg=${startDate}&end=20500101&ut=fa5fd1943c7b386f172d6893dbfba10b&rtntype=6&secid=1.000001&klt=101&fqt=2&cb=jsonp1612962811185`,
    );
    const deal = () => {
      function jsonp1612962811185(data) {
        return data?.data?.klines[0] || '';
      }
      const target = eval(data);
      const [date, , , , , volume, , , value, , change] = target.split(',');
      return {
        date,
        volume: parseFloat((parseInt(volume) / 100000000).toFixed(2)),
        value,
        change: parseFloat(change),
      };
    };
    return deal();
  }

  async getChannelShareFinanceReport() {
    const channels = await this.getChannels();
    return {
      data: {
        channels,
      },
    };
  }

  async getChannels() {
    const channels = await this.httpService
      .get(
        'https://86.push2.eastmoney.com/api/qt/clist/get?cb=callback&pn=1&pz=100&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f3&fs=m:90+t:2+f:!50&fields=f12,f14',
      )
      .then((res) => {
        const callback = (res) => res.data && res.data.diff;
        return eval(res);
      });
    return {
      channels: channels.map((item) => ({ code: item.f12, name: item.f14 })),
    };
  }

  async refreshConcepts() {
    const concepts = await this.httpService
      .get(
        'https://59.push2.eastmoney.com/api/qt/clist/get?cb=callback&pn=2&pz=20&po=1&np=2&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f3&fs=m:90+t:3+f:!50&fields=f12,f14',
      )
      .then((res) => {
        const callback = (res) => {
          const data = res.data && res.data.diff;
          return Object.values(data);
        };
        return eval(res);
      });
    return await this.ticketConcept
      .save(
        concepts.map((item) => ({ code: item.f12, name: item.f14 })),
        {
          reload: true,
        },
      )
      .then(() => {
        return 'refreshed';
      })
      .catch(() => {
        return 'refresh error';
      });
  }

  async getConcepts({
    page = 0,
    pageSize = 30,
    isShow = 0,
  }: IPaginationDto & { isShow?: number }) {
    const [list, total] = await this.ticketConcept
      .createQueryBuilder()
      .where(
        !!isShow
          ? {
              isShow,
            }
          : {},
      )
      .offset(page * pageSize)
      .limit(pageSize)
      .getManyAndCount();
    return {
      list,
      total,
      pageTotal: Math.ceil(total / pageSize),
      pageSize,
      page,
    };
  }

  async optionConcept(code: string, isShow: number) {
    return await this.ticketConcept
      .save(
        {
          code,
          isShow,
        },
        {
          reload: true,
        },
      )
      .then(() => {
        return 'refreshed';
      })
      .catch((error) => {
        return { data: 'refresh error', message: error };
      });
  }

  async getChannelShares(code = 'BK0539') {
    const data = await this.httpService
      .get(
        `https://push2.eastmoney.com/api/qt/clist/get?cb=callback&fid=f62&po=1&pz=500&pn=1&np=1&fltt=2&invt=2&ut=b2884a393a59ad64002292a3e90d46a5&fs=b:${code}&fields=f12,f14`,
      )
      .then((res) => {
        const callback = (res) => res.data && res.data.diff;
        return eval(res);
      });
    const list = [];
    for (const { f12, f14 } of data) {
      const code = f12.startsWith('0')
        ? `SZ${f12}`
        : f12.startsWith('6')
        ? `SH${f12}`
        : 0;

      if (code) {
        // const share = await this.ticketShare.save(
        //   {
        //     code,
        //     name: f14,
        //   },
        //   {
        //     reload: true,
        //   },
        // );
        // await this.ticketConcept.save(
        //   {
        //     code,
        //     shares: [share],
        //   },
        //   {
        //     reload: true,
        //   },
        // );
        const item = await this.getSharesFinanceReport(code);
        list.push({
          ...item,
          name: f14,
        });
      }
    }
    return {
      list,
    };
  }

  async getSharesFinanceReport(code = 'SH603456', year = 2021) {
    const previousYear = year - 1;
    const previous = `${previousYear}-03-31,${previousYear}-06-30,${previousYear}-09-30,${previousYear}-12-31`;
    const current = `${year}-03-31,${year}-06-30,${year}-09-30,${year}-12-31`;
    const data = await Promise.all([
      await this.httpService
        .get(
          `http://f10.eastmoney.com/NewFinanceAnalysis/lrbAjaxNew?companyType=4&reportDateType=0&reportType=2&dates=${previous}&code=${code}`,
        )
        .then((res) => {
          try {
            return res.data
              .map((item) => item.PARENT_NETPROFIT / 100000000)
              .reverse();
          } catch (e) {
            return [];
          }
        }),
      await this.httpService
        .get(
          `http://f10.eastmoney.com/NewFinanceAnalysis/lrbAjaxNew?companyType=4&reportDateType=0&reportType=2&dates=${current}&code=${code}`,
        )
        .then((res) => {
          try {
            return res.data
              .map((item) => item.PARENT_NETPROFIT / 100000000)
              .reverse();
          } catch (e) {
            return [];
          }
        }),
    ]);
    return analysisFinanceReport(data);
  }
}

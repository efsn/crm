// eslint-disable-next-line @typescript-eslint/no-var-requires
const cheerio = require('cheerio');
import { dateFormat } from '../../../utils/common';

export const getMlf = (html, time) => {
  const $ = cheerio.load(html);
  const content = $.root().find('#zoom >p').eq(0).text();
  const tips = ['存款准备金', '释放长期资', '降准', '续做', 'MLF'].some(
    (item) => content.indexOf(item) !== -1,
  );
  const message = {
    day: {},
    month: {},
    year: {},
  };
  $('table').each((index, table) => {
    $(table)
      .find('tr')
      .map((index, tr) => {
        const one = $(tr).find('td').eq(0).find('p').text();
        const two = $(tr).find('td').eq(1).find('p').text();
        const attr = one.slice(0, one.length - 1);
        if (one === '期限') return;
        const util = one.slice(-1);
        const value = parseFloat(two);
        if (util == '天') {
          if (!message.day[attr]) message.day[attr] = value;
          else message.day[attr] += value;
        }
        if (util == '年') {
          if (!message.year[attr]) message.year[attr] = value;
          else message.year[attr] += value;
        }
        if (util == '月') {
          if (!message.month[attr]) message.month[attr] = value;
          else message.month[attr] += value;
        }
      });
  });
  const current = new Date(time);
  const date = dateFormat(current, 'yyyy-MM-dd');
  const months = Object.keys(message.month).map((item) => {
    const next: number = parseInt(item);
    const end = dateFormat(
      new Date(
        current.getFullYear(),
        current.getMonth() + next,
        current.getDate(),
      ),
      'yyyy-MM-dd',
    );

    return {
      start: date,
      recovery: end,
      value: parseFloat(-message.month[item] + ''),
    };
  });
  const years = Object.keys(message.year).map((item) => {
    const next: number = parseInt(item);
    const end = dateFormat(
      new Date(
        current.getFullYear() + next,
        current.getMonth(),
        current.getDate(),
      ),
      'yyyy-MM-dd',
    );

    return {
      start: date,
      recovery: end,
      value: parseFloat(-message.year[item] + ''),
    };
  });
  const days = Object.keys(message.day).map((item) => {
    const next: number = parseInt(item);
    const end = dateFormat(
      new Date(
        current.getFullYear(),
        current.getMonth(),
        current.getDate() + next,
      ),
      'yyyy-MM-dd',
    );

    return {
      start: date,
      recovery: end,
      value: parseFloat(-message.day[item] + ''),
    };
  });
  return {
    list: [...days, ...months, ...years],
    tips,
    date,
  };
};

export const getOtherMlf = (html) => {
  const $ = cheerio.load(html);
  let target = null;
  $('table').each((index, table) => {
    $(table)
      .find('tr')
      .map((index, tr) => {
        const one = $(tr).find('td').eq(0).find('p').text();
        const two = $(tr).find('td').eq(1).find('p').text();
        const three = $(tr).find('td').eq(2).find('p').text();
        const four = $(tr).find('td').eq(3).find('p').text();
        if (one === '名称') return;
        target = {
          value: -parseInt(two + ''),
          start: dateFormat(
            three.replace('日', '').replace(/[^\d]/g, '-'),
            'yyyy-MM-dd',
          ),
          recovery: dateFormat(
            four.replace('日', '').replace(/[^\d]/g, '-'),
            'yyyy-MM-dd',
          ),
          type: '1',
          tips: '',
          state: 1,
        };
      });
  });
  return target;
};

export const getMlfList = (html) => {
  const $ = cheerio.load(html);
  const list = [];
  $('.newslist_style a').each((index, item) => {
    list.push($(item).attr('href'));
  });
  return list;
};

export const getRecentDays = () => {
  const today = new Date();
  const list = [];
  for (const item of [0, 1, 2, 3, 4, 5, 6, 7]) {
    list.push({
      recovery: dateFormat(
        new Date(today.getFullYear(), today.getMonth(), today.getDate() + item),
        'yyyy-MM-dd',
      ),
    });
  }
  return list;
};

export const analysisFinanceReport = (data: [[], []]) => {
  const current = data[1];
  const previous = data[0].slice(0, current.length);
  const totalCurrent = current.reduce((a, b) => a + b, 0);
  const totalPrevious = previous.reduce((a, b) => a + b, 0);
  // 当年业绩增加
  const totalScale = (
    ((totalCurrent - totalPrevious) * 100) /
    Math.abs(totalPrevious)
  ).toFixed(2);
  // 季度业绩同比增加
  const yearOnYearScale = (
    ((current[current.length - 1] - previous[current.length - 1]) * 100) /
    Math.abs(previous[current.length - 1])
  ).toFixed(2);
  // 季度业绩环比增加
  const previousScale =
    current.length > 1
      ? (
          ((current[current.length - 1] - current[current.length - 2]) * 100) /
          Math.abs(current[current.length - 2])
        ).toFixed(2)
      : (
          ((current[current.length - 1] - previous[previous.length - 1]) *
            100) /
          previous[previous.length - 1]
        ).toFixed(2);
  return {
    totalScale,
    yearOnYearScale,
    previousScale,
    value: current[current.length - 1],
  };
};

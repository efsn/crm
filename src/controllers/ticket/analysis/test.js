const cheerio = require('cheerio');
const html = `<div id="zoom" class="zoom1"> 
             <p>2020年3月16日，人民银行实施定向降准，释放长期资金5500亿元。同时，开展中期借贷便利（MLF）操作1000亿元。今日不开展逆回购操作。具体情况如下：</p>
             <p align="center"><span style="font-size: medium"><strong><span style="color: #222222"><span style="font-family: 宋体">MLF</span></span></strong></span><strong><span style="color#222222"><span style="font-family: 宋体">操作情况</span></span></strong></p>
             <p></p>
             <table align="center" border="1" cellpadding="0" cellspacing="0" style="border-bottom: windowtext 1px solid; border-left: windowtext 1px solid; width: 526px; border-top: windowtext 1px solid; border-right: windowtext 1px solid" width="526">
              <tbody> 
               <tr> 
                <td style="border-bottom: windowtext 1px solid; border-left: windowtext 1px solid; width: 175px; height: 21px; border-top: windowtext 1px solid; border-right: windowtext 1px solid"><p align="center"><span style="font-size: medium"><span style="color: #222222"><span style="font-family: 宋体">期限</span></span></span></p> </td> 
                <td style="border-bottom: windowtext 1px solid; border-left: windowtext 1px solid; width: 175px; height: 21px; border-top: windowtext 1px solid; border-right: windowtext 1px solid"><p align="center"><span style="font-size: medium"><span style="color: #222222"><span style="font-family: 宋体">操作量</span></span></span></p> </td> 
                <td style="border-bottom: windowtext 1px solid; border-left: windowtext 1px solid; width: 175px; height: 21px; border-top: windowtext 1px solid; border-right: windowtext 1px solid"><p align="center"><span style="font-size: medium"><span style="color: #222222"><span style="font-family: 宋体">中标利率</span></span></span></p> </td> 
               </tr> 
               <tr> 
                <td style="border-bottom: windowtext 1px solid; border-left: windowtext 1px solid; width: 175px; height: 21px; border-top: windowtext 1px solid; border-right: windowtext 1px solid"><p align="center"><span style="font-size: medium"><span style="color: #222222"><span style="font-family: arial, sans-serif">1</span></span></span><span style="color: #222222"><span style="font-family: 宋体">年</span></span></p> </td> 
                <td style="border-bottom: windowtext 1px solid; border-left: windowtext 1px solid; width: 175px; height: 21px; border-top: windowtext 1px solid; border-right: windowtext 1px solid"><p align="center"><span style="font-size: medium"><span style="color: #222222"><span style="font-family: arial, sans-serif">1000</span></span></span><span style="color: #222222"><span style="font-family: 宋体">亿元</span></span></p> </td> 
                <td style="border-bottom: windowtext 1px solid; border-left: windowtext 1px solid; width: 175px; height: 21px; border-top: windowtext 1px solid; border-right: windowtext 1px solid"><p align="center"><span style="color: #222222"><span style="font-family: arial, sans-serif"><span style="font-size: medium">3.15%</span></span></span></p> </td> 
               </tr>
              </tbody>
             </table>
             <div style="clear: both"></div>
             <p align="center"></p>
             <p style="text-align: center">中国人民银行公开市场业务操作室</p>
             <p style="text-align: center">二〇二〇年三月十六日</p> 
            </div>
`;
const $ = cheerio.load(html);
const content = $.root().find('#zoom >p').eq(0).text();
const tips = ['存款准备金', '释放长期资', '降准'].some(
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

console.log(message, tips);

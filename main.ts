import cheerio from 'cheerio';
import request from 'request-promise';
import xlsx from 'node-xlsx';
import fs from 'fs';

interface data {
  date: string;
  income: string;
}

(async function () {
  let body = await request(
    'http://quotes.money.163.com/f10/zycwzb_600519.html#01c01'
  );
  const $ = cheerio.load(body);
  let trs = $('.scr_table tr');

  let dates: string[] = [];
  let incomes: string[] = [];

  $(trs[0])
    .find('th')
    .each((index, item) => {
      dates.push($(item).text());
    });

  $(trs[11])
    .find('td')
    .map((index, item) => {
      incomes.push($(item).text());
    });

  // console.log(dates.length, incomes.length);

  let data = [];

  for (let i = 0; i < Math.max(dates.length, incomes.length); i++) {
    data.push([dates[i], incomes[i] || '']);
  }
  // console.log(data);

  const title = ['日期', '净利润(扣除非经常性损益后)(万元)'];

  let buffer = xlsx.build([{ name: 'incomeSheet', data: [title, ...data] }], {
    '!cols': [{ wch: 10 }, { wch: 30 }],
  });

  fs.writeFile('./茅台.xlsx', Buffer.from(buffer), (err) => {
    if (err) {
      console.error('保存失败');
      return;
    }
    console.log('文件已保存');
  });
})();

import _ from 'lodash';
import fs from 'fs';
import csvWriter from 'csv-write-stream';

import calcRefExchanges from './calcRefExchanges';

/**
 * write new trade data to csv files
 */
export default async function logTradesCSV (st, job, trades, mine) {

  // if bot trade, say my_trades.csv otherwise ALTBTC_trades.csv
  const FILE_PATH = (
    'logs/' +
    (mine ? 'my_' : job.coin1 + job.coin2 + '_') +
    'trades' +
    '.csv'
  );

  try {
    let writer = csvWriter();

    // write headers to file if it doesn't exist, otherwise don't;
    if (!fs.existsSync(FILE_PATH)) {
      writer = csvWriter({ headers: [
        'datetime',
        'timestamp',
        'exchange',
        'pair',
        'refPrice',
        'tradePrice',
        'offset',
        'amount',
        'profit'
      ]});

    } else {
      writer = csvWriter({sendHeaders: false});
    }

    // add lines to file
    writer.pipe(fs.createWriteStream(FILE_PATH, {flags: 'a'}));

    trades.forEach(trade => {
      let refPrice = calcRefExchanges(st)[trade.symbol];
      let tradePrice = trade.price;
      let offset = _.floor((tradePrice - refPrice) / refPrice * 100.0, 2);

      writer.write({
        datetime: trade.datetime,
        timestamp: trade.timestamp,
        exchange: job.exchange,
        pair: trade.symbol,
        refPrice: refPrice,
        tradePrice: tradePrice,
        offset: offset,
        amount: trade.amount,
        profit: Math.abs(_.floor(trade.amount * offset / 100.0, 8))
      });
    });

    writer.end();

    // write down the time of last entry so don't repeat trades
    st.exchanges[job.exchange].fetchedMyTradesTime = new Date().getTime();

    console.log('Trade log updated for bot trades');

  } catch (e) {
    console.error('Failed writing bot trades to file');
  }

}

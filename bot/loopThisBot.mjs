/**
 * This function loops the action (job) generation of a single bot.
 * Depending on type of bot it is, the job sequence will be different
 */
export default async function loopThisBot (st, bot) {
  // console.log('Bot #', bot.id, 'type', bot.type, 'loop initiated');
  // generate jobs

  if (bot.type === 'info') {

    // get ref price
    st.jobs.push({
      name: 'fetchTicker',
      id: st.jobId++,
      exchange: bot.sourceRef,
      coin1: bot.coin1,
      coin2: bot.coin2,
      timeout: bot.botStepDelay,
      exchangeDelay: bot.sourceRefDelay
    });
  }

  if (bot.type === 'arbot') {
    // steps 2 & 3 need to be shared between bots on same exchange

    // 1) get ref price
    st.jobs.push({
      name: 'fetchTicker',
      id: st.jobId++,
      exchange: bot.sourceRef,
      coin1: bot.coin1,
      coin2: bot.coin2,
      exchangeDelay: bot.sourceRefDelay,
      timeout: bot.botStepDelay,
      timestamp: new Date().getTime()
    });

    if (bot.leadsSharedEvents) {
      // 2) get updated account balances
      st.jobs.push({
        name: 'fetchBalances',
        id: st.jobId++,
        exchange: bot.sourceTrade,
        exchangeDelay: bot.sourceTradeDelay,
        timeout: bot.botStepDelay,
        timestamp: new Date().getTime()
      });

      // 3) cancel previous orders
      st.jobs.push({
        name: 'cancelOrders',
        id: st.jobId++,
        exchange: bot.sourceTrade,
        exchangeDelay: bot.sourceTradeDelay,
        timeout: bot.botStepDelay,
        timestamp: new Date().getTime()
      });
    }

    bot.offsetPercent.forEach((offset, eaIndex) => {
      let pair = bot.coin1 + '/' + bot.coin2;
      let calc = st.data.history[pair] ? st.data.history[pair].rawCalc : undefined;

      // only use stdev if its above minimum price offset
      let useSTDEV = calc ? (calc.stdev > bot.minSTDEV) : false;

      // 4) place buy order
      st.jobs.push({
        name: 'createBuyOrder',
        id: st.jobId++,
        exchange: bot.sourceTrade,
        coin1: bot.coin1,
        coin2: bot.coin2,
        priceSource: bot.sourceRef,
        offsetPercent: offset,
        useSTDEV: useSTDEV,
        offsetSTDEV: bot.offsetSTDEV[eaIndex],
        stdev: calc ? calc.stdev : undefined,
        mean: calc ? calc.mean : undefined,
        positionFraction: bot.positionFraction[eaIndex],
        exchangeDelay: bot.sourceTradeDelay,
        maxWaitTime: bot.botStepDelay / 1.1,
        timeout: bot.botStepDelay,
        timestamp: new Date().getTime()
      });

      // 5) place sell order
      st.jobs.push({
        name: 'createSellOrder',
        id: st.jobId++,
        exchange: bot.sourceTrade,
        coin1: bot.coin1,
        coin2: bot.coin2,
        priceSource: bot.sourceRef,
        offsetPercent: offset,
        useSTDEV: useSTDEV,
        offsetSTDEV: bot.offsetSTDEV[eaIndex],
        stdev: calc ? calc.stdev : undefined,
        mean: calc ? calc.mean : undefined,
        positionFraction: bot.positionFraction[eaIndex],
        exchangeDelay: bot.sourceTradeDelay,
        maxWaitTime: bot.botStepDelay / 1.1,
        timeout: bot.botStepDelay,
        timestamp: new Date().getTime()
      });
    });

    if (bot.leadsSharedEvents) {
      // (optional) fetch bot complete trades from exchange
      st.jobs.push({
        name: 'fetchMyTrades',
        id: st.jobId++,
        exchange: bot.sourceTrade,
        coin1: bot.coin1,
        coin2: bot.coin2,
        exchangeDelay: bot.sourceTradeDelay * 3,
        timeout: bot.botStepDelay,
        timestamp: new Date().getTime()
      });
    }

    // (optional) fetch all trades for this pair
    st.jobs.push({
      name: 'fetchPairTrades',
      id: st.jobId++,
      exchange: bot.sourceTrade,
      coin1: bot.coin1,
      coin2: bot.coin2,
      exchangeDelay: bot.sourceTradeDelay * 3,
      timeout: bot.botStepDelay,
      timestamp: new Date().getTime()
    });
  }

  // loose bot step delay
  await new Promise(resolve => setTimeout(resolve, bot.botStepDelay));

  // reoeat this loop
  loopThisBot(st, bot);
}

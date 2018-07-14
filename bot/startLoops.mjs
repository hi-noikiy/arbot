import initializeExchanges from './initializeExchanges';
import startBots from './startBots';
import loopJobs from './loopJobs';
import loopPerformance from './loopPerformance';

/**
 * A function that initiates all the necessary async loops.
 * These include the individual bots, job execution, and performance calculations.
 */
export default async function startLoops (st) {

  // initialize exchanges with auth info where necessary
  console.log('initializing exchanges');
  await initializeExchanges(st);

  // run the main bot loop that generates jobs
  console.log('starting bot loop');
  startBots(st);

  // run job execution loop
  console.log('starting job running loop');
  loopJobs(st);

  console.log('start performance logging loop');
  loopPerformance(st);

}

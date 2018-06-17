import startLoops from './bot/startLoops';
import initialBots from './_initialBots';
import State from './elements/State';

// create this app state
let st = new State();

// load the settings for initial set of bots
initialBots(st);

// initialize the operation
startLoops(st);

console.log('Reached the end of server.mjs file');

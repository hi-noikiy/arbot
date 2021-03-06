import _ from 'lodash'; // useful math libarary

/**
 * takes difference in miliseconds and converts it to days hours minutes seconds format
 */
function diffToDays (inMS) {
  let MSinSec = 1000;
  let MSinMin = MSinSec * 60;
  let MSinHour = MSinMin * 60;
  let MSinDay = MSinHour * 24;

  let days = _.floor(inMS / MSinDay);
  let hours = _.floor((inMS % MSinDay) / MSinHour);
  let minutes = _.floor((inMS % MSinDay % MSinHour) / MSinMin);
  let seconds = _.floor((inMS % MSinDay % MSinHour % MSinMin) / MSinSec, 1);

  return days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds.toFixed(1) + 's';
}

export default diffToDays;

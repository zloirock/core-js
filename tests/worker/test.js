'use strict';
const worker = new Worker('./worker/runner.js');
worker.addEventListener('error', e => {
  // eslint-disable-next-line no-console -- output
  console.error(e);
});
worker.addEventListener('message', message => {
  // eslint-disable-next-line no-console -- output
  console.log(message.data);
});

'use strict';
var worker = new Worker('./worker/runner.js');

worker.addEventListener('error', function (e) {
  // eslint-disable-next-line no-console -- output
  console.error(e);
});

worker.addEventListener('message', function (message) {
  // eslint-disable-next-line no-console -- output
  console.log(message.data);
});

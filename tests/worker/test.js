var worker = new Worker('./worker/runner.js');
worker.addEventListener('error', function (e) {
  // eslint-disable-next-line no-console
  console.error(e);
});
worker.addEventListener('message', function (message) {
  // eslint-disable-next-line no-console
  console.log(message.data);
});

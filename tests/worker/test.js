var worker = new Worker('./worker/runner.js');
worker.addEventListener('error', function (e) {
  console.error(e);
});
worker.addEventListener('message', function (message) {
  console.log(message.data);
});

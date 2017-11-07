importScripts('../../client/core.js');

postMessage(typeof core !== 'undefined');

setImmediate(function () {
  postMessage('setImmediate');
});

Promise.resolve().then(function () {
  postMessage('Promise.resolve');
});

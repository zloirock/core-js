'use strict';
importScripts('../bundles/core-js.js');

postMessage(typeof core !== 'undefined');

setImmediate(function () {
  postMessage('setImmediate');
});

// eslint-disable-next-line es/no-promise -- safe
Promise.resolve().then(function () {
  postMessage('Promise.resolve');
});

'use strict';
importScripts('../../packages/core-js-bundle/index.js');

postMessage(typeof core != 'undefined');

setImmediate(function () {
  postMessage('setImmediate');
});

// eslint-disable-next-line es/no-promise -- safe
Promise.resolve().then(function () {
  postMessage('Promise.resolve');
});

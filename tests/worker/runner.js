'use strict';
importScripts('../../packages/core-js-bundle/index.js');

postMessage(typeof core !== 'undefined');

setImmediate(() => {
  postMessage('setImmediate');
});

Promise.resolve().then(() => {
  postMessage('Promise.resolve');
});

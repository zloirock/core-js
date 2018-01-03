'use strict';
importScripts('../../packages/core-js/client/core.js');

postMessage(typeof core !== 'undefined');

setImmediate(() => {
  postMessage('setImmediate');
});

Promise.resolve().then(() => {
  postMessage('Promise.resolve');
});

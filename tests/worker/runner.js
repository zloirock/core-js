'use strict';
importScripts('../../client/core.js');

postMessage(typeof core !== 'undefined');

setImmediate(() => {
  postMessage('setImmediate');
});

Promise.resolve().then(() => {
  postMessage('Promise.resolve');
});

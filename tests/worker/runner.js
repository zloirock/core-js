importScripts('../../client/core.js');

postMessage(typeof core != 'undefined');

setImmediate(_ => postMessage('setImmediate'));

Promise.resolve().then(_ => postMessage('Promise.resolve'));
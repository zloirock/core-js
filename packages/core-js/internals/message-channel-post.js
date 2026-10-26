'use strict';
var globalThis = require('../internals/global-this');
var getBuiltInNodeModule = require('../internals/get-built-in-node-module');

var $MessageChannel = globalThis.MessageChannel;
var WorkerThreads;

// Node < 15 has it only in `worker_threads`
if (!$MessageChannel) {
  WorkerThreads = getBuiltInNodeModule('worker_threads');
  if (WorkerThreads) $MessageChannel = WorkerThreads.MessageChannel;
}

var close = function (channel) {
  channel.port1.close();
  channel.port2.close();
};

// a message nobody receives is held with its channel until the ports are closed,
// so each message goes through a fresh channel, closed right after it
module.exports = $MessageChannel && function (message, transfer) {
  var channel = new $MessageChannel();
  try {
    if (transfer) channel.port1.postMessage(message, transfer);
    // eslint-disable-next-line unicorn/require-post-message-target-origin -- safe
    else channel.port1.postMessage(message);
  } catch (error) {
    close(channel);
    throw error;
  }
  close(channel);
};

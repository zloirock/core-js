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

module.exports = $MessageChannel;

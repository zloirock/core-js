'use strict';
var globalThis = require('../internals/global-this');
var apply = require('../internals/function-apply');
var isCallable = require('../internals/is-callable');
var fails = require('../internals/fails');
var arraySlice = require('../internals/array-slice');
var validateArgumentsLength = require('../internals/validate-arguments-length');
var IS_IOS = require('../internals/environment-is-ios');
var IS_NODE = require('../internals/environment-is-node');

var $setImmediate = globalThis.setImmediate;
var $clearImmediate = globalThis.clearImmediate;

// Node.js 0.9+, Bun 0.1.7 and IE10+ has setImmediate and clearImmediate, otherwise:
if (!$setImmediate || !$clearImmediate) {
  var $setTimeout = globalThis.setTimeout;
  var process = globalThis.process;
  var Dispatch = globalThis.Dispatch;
  var MessageChannel = globalThis.MessageChannel;
  var $Function = Function;
  var counter = 0;
  var queue = Object.create(null);
  var $location, defer, channel, port;

  fails(function () {
    // Deno throws a ReferenceError on `location` access without `--location` flag
    $location = globalThis.location;
  });

  var run = function (id) {
    var fn = queue[id];
    if (fn) {
      delete queue[id];
      fn();
    }
  };

  var runner = function (id) {
    return function () {
      run(id);
    };
  };

  var eventListener = function (event) {
    run(event.data);
  };

  var globalPostMessageDefer = function (id) {
    // old engines have not location.origin
    globalThis.postMessage(id + '', $location.protocol + '//' + $location.host);
  };

  $setImmediate = function setImmediate(handler) {
    validateArgumentsLength(arguments.length, 1);
    var fn = isCallable(handler) ? handler : $Function(handler);
    var args = arraySlice(arguments, 1);
    queue[++counter] = function () {
      apply(fn, undefined, args);
    };
    defer(counter);
    return counter;
  };
  $clearImmediate = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (IS_NODE) {
    defer = function (id) {
      process.nextTick(runner(id));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(runner(id));
    };
  // Browsers with MessageChannel, includes WebWorkers
  // except iOS - https://github.com/zloirock/core-js/issues/624
  } else if (MessageChannel && !IS_IOS) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = eventListener;
    defer = port.postMessage.bind(port);
  // Browsers with postMessage, skip WebWorkers
  } else if (
    globalThis.addEventListener &&
    isCallable(globalThis.postMessage) &&
    !globalThis.importScripts &&
    $location && $location.protocol !== 'file:' &&
    !fails(globalPostMessageDefer)
  ) {
    defer = globalPostMessageDefer;
    globalThis.addEventListener('message', eventListener, false);
  // Rest old browsers
  } else {
    defer = function (id) {
      $setTimeout(runner(id), 0);
    };
  }
}

module.exports = {
  set: $setImmediate,
  clear: $clearImmediate,
};

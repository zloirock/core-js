'use strict';
var $ = require('../internals/export');
var microtask = require('../internals/microtask');
var aCallable = require('../internals/a-callable');
var validateArgumentsLength = require('../internals/validate-arguments-length');

// `queueMicrotask` method
// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-queuemicrotask
$({ global: true, enumerable: true, dontCallGetSet: true }, {
  queueMicrotask: function queueMicrotask(fn) {
    validateArgumentsLength(arguments.length, 1);
    microtask(aCallable(fn));
  }
});

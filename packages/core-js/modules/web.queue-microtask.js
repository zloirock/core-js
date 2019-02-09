// `queueMicrotask` method
// https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#dom-queuemicrotask
var microtask = require('../internals/microtask');
var process = require('../internals/global').process;
var isNode = require('../internals/classof-raw')(process) == 'process';

require('../internals/export')({ global: true, enumerable: true, noTargetGet: true }, {
  queueMicrotask: function queueMicrotask(fn) {
    var domain = isNode && process.domain;
    microtask(domain ? domain.bind(fn) : fn);
  }
});

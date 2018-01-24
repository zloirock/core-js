// https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-09/sept-25.md#510-globalasap-for-enqueuing-a-microtask
var microtask = require('./_microtask')();
var process = require('core-js-internals/global').process;
var isNode = require('core-js-internals/classof-raw')(process) == 'process';

require('./_export')({ global: true }, {
  asap: function asap(fn) {
    var domain = isNode && process.domain;
    microtask(domain ? domain.bind(fn) : fn);
  }
});

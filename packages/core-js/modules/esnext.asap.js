// https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-09/sept-25.md#510-globalasap-for-enqueuing-a-microtask
var microtask = require('../internals/microtask')();
var process = require('../internals/global').process;
var isNode = require('../internals/classof-raw')(process) == 'process';

require('../internals/export')({ global: true }, {
  asap: function asap(fn) {
    var domain = isNode && process.domain;
    microtask(domain ? domain.bind(fn) : fn);
  }
});

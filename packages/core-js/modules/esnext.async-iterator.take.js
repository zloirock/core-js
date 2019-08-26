'use strict';
// https://github.com/tc39/proposal-iterator-helpers
var $ = require('../internals/export');
var anObject = require('../internals/an-object');
var toLength = require('../internals/to-length');
var createAsyncIteratorProxy = require('../internals/create-async-iterator-proxy');

var AsyncIteratorProxy = createAsyncIteratorProxy(function (arg) {
  if (!this.remaining--) {
    this.done = true;
    return { done: true, value: undefined };
  } return this.next.call(this.iterator, arg);
});

$({ target: 'AsyncIterator', proto: true, real: true }, {
  take: function take(limit) {
    return new AsyncIteratorProxy({
      iterator: anObject(this),
      remaining: toLength(limit)
    });
  }
});
